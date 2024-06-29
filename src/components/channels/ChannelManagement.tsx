"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import ChannelDialog from "./channelForm";
import ChannelTable from "./ChannelTable";
import { UserWithPermission } from "@/types/types";
import { ChannelData } from "@/types/types";
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

interface ChannelManagementProps {
  data: Channel[];
  totalRowCount: number;
}

const ChannelManagement: React.FC<ChannelManagementProps> = ({
  data,
  totalRowCount,
}) => {
  const [open, setOpen] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<ChannelData | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<ChannelData>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [ability, setAbility] = useState<AppAbility | null>(null);
  // const [refetcher, setRefetcher] = useState<boolean>(false);
  const { data: session } = useSession();
  const user = session?.user;

  const getSession = () => {
    if (user) {
      console.log(user);
    }
  };

  useEffect(() => {
    getSession();
  }, [getSession]);

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

  const handleSubmit = async () => {
    try {
      if (currentChannel && currentChannel.id !== undefined) {
        const { userId } = await getChannelById(currentChannel.id);

        if (
          ability &&
          ability.can(
            "update",
            subject("Channel", { ...currentChannel } as Channel)
          )
        ) {
          await updateChannel(
            currentChannel.id,
            { ...formData, userId },
            user as UserWithPermission
          );
          // setRefetcher(true)
        } else {
          setValidationError(
            "You do not have permission to update this channel."
          );
        }
        // setRefetcher(false)
      } else if (ability && ability.can("create", "Channel")) {
        await createChannel({ ...formData, userId: user!.id }, user!);
        socket.emit("addChannel");
      } else {
        setValidationError("You do not have permission to create a channel.");
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
        await deleteChannel(id, user!);
      } catch (error) {
        console.error("Error deleting channel:", error);
      }
    } else {
      setValidationError("You do not have permission to delete this channel.");
    }
  };

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
        user={user as UserWithPermission}
        ability={ability}
        handleOpen={handleOpen}
        handleDelete={handleDelete}
        // refetcher={refetcher}
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
      />
    </Box>
  );
};

export default ChannelManagement;
