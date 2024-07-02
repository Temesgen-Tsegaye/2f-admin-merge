"use client";
import React, { useState, useEffect, useCallback } from "react";
import ChannelDialog from "./channelForm";
import ChannelTable from "./ChannelTable";
import { UserWithPermission } from "@/types/types";
import { ChannelData } from "@/types/types";
import { useSnackbar } from "notistack";
import { AppAbility, defineAbilitiesFor } from "@/lib/abilities";
import {
  createChannel,
  updateChannel,
  deleteChannel,
  getChannelById,
} from "@/actions/channelAction";
import { ZodError } from "zod";
import { Box } from "@mui/material";
import { subject } from "@casl/ability";
import { Channel } from "@prisma/client";
import { socket } from "@/utils/socket-cleint";
import Loading from "@/app/loading";

interface ChannelManagementProps {
  data: Channel[];
  totalRowCount: number;
  user: UserWithPermission;
}

const ChannelManagement: React.FC<ChannelManagementProps> = ({
  data,
  totalRowCount,
  user,
}) => {
  const [open, setOpen] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<ChannelData | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<ChannelData>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [ability, setAbility] = useState<AppAbility | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchAbilities = async () => {
      if (user) {
        const fetchedAbility = await defineAbilitiesFor(user);
        setAbility(fetchedAbility);
      }
    };
    fetchAbilities();
  }, [user]);

  const handleOpen = (channel: ChannelData | null = null) => {
    setCurrentChannel(channel);
    setFormData(channel ? { ...channel } : {});
    setOpen(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, status: event.target.checked });
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentChannel(null);
    setFormData({});
    setValidationError(null);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      if (currentChannel && currentChannel.id !== undefined) {
        const { userId } = await getChannelById(currentChannel.id);

        if (
          ability?.can(
            "update",
            subject("Channel", { ...currentChannel } as Channel)
          )
        ) {
          setIsSaving(true);
          await updateChannel(currentChannel.id, { ...formData, userId }, user);
          enqueueSnackbar("Channel updated successfully", {
            variant: "success",
          });
          setIsSaving(false);
        } else {
          enqueueSnackbar(
            "You do not have permission to update this channel.",
            { variant: "error" }
          );
        }
      } else if (ability?.can("create", "Channel")) {
        setIsSaving(true);
        await createChannel({ ...formData, userId: user.id }, user);
        enqueueSnackbar("Channel created successfully", { variant: "success" });
        socket.emit("addChannel");
        setIsSaving(false);
      } else {
        enqueueSnackbar("You do not have permission to create a channel.", {
          variant: "error",
        });
      }
      handleClose();
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationError(error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    const channelToDelete = channels.find((channel) => channel.id === id);
    if (
      ability &&
      ability.can(
        "delete",
        subject("Channel", { ...channelToDelete } as Channel)
      ) &&
      window.confirm("Are you sure you want to delete this channel?")
    ) {
      try {
        await deleteChannel(id, user);
        setChannels(channels.filter((channel) => channel.id !== id));
        enqueueSnackbar("Channel deleted successfully", { variant: "error" });
      } catch (error) {
        console.error("Error deleting channel:", error);
      }
    } else {
      setValidationError("You do not have permission to delete this channel.");
    }
  };

  if (!ability) {
    return (
      <Box>
        <Loading />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "auto",
        maxWidth: "calc(100vw - 15vw)",
        boxShadow: "2px 2px 10px 5px rgba(0, 0, 0, 0.2)",
      }}
    >
      <ChannelTable
        user={user}
        ability={ability}
        handleOpen={handleOpen}
        handleDelete={handleDelete}
        data={data}
        totalRowCount={totalRowCount}
      />
      <ChannelDialog
        open={open}
        currentChannel={currentChannel}
        formData={formData}
        validationError={validationError}
        ability={ability}
        handleChange={handleChange}
        handleSwitchChange={handleSwitchChange}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </Box>
  );
};

export default ChannelManagement;
