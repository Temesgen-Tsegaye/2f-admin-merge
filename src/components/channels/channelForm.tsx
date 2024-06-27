
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  lighten,
} from "@mui/material";

import { z, ZodError } from "zod";

import { AppAbility, defineAbilitiesFor } from "@/lib/abilities";

import {
  createChannel,
  updateChannel,
  getChannelById,
} from "@/server-actions/channelActions";
import { UserWithRole } from "@/context/types";
import { ChannelData } from "@/lib/typeCollection";
import { Channel } from "@prisma/client";
import { subject } from "@casl/ability";
// import { useAbility } from "@casl/react";

const channelSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(20),
  isActive: z.boolean().optional(),
  userId: z.number().optional(),
});

interface ChannelManagementProps {
  user: UserWithRole;
}

const ChannelForm: React.FC<ChannelManagementProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<ChannelData | null>(
    null
  );

  const [formData, setFormData] = useState<Partial<ChannelData>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isError, setIsError] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isActive: event.target.checked });
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentChannel(null);
    setFormData({});
    setValidationError(null);
  };
  console.log(formData);
  const handleSubmit = async () => {
    setIsSaving(true);
    setIsError(false);
    try {
      channelSchema.parse(formData);

      if (currentChannel && currentChannel.id !== undefined) {
        const { userId } = await getChannelById(currentChannel.id);

        // if (
        //   ability &&
        //   ability.can(
        //     "update",
        //     subject("Channel", { ...currentChannel } as Channel)
        //   )
        // ) {
        await updateChannel(
          currentChannel.id,
          { ...formData, userId: userId },
          user
        );
        channelsData();
        // } else {
        //   console.log("You do not have permission to update this channel.");
        //   setValidationError(
        //     "You do not have permission to update this channel."
        //   );
        // }
      } else {
        // if (ability && ability.can("create", "Channel")) {
        const dataToSubmit = { ...formData, userId: user.id };
        await createChannel(dataToSubmit, user);
        channelsData();
        // } else {
        //   setValidationError("You do not have permission to create a channel.");
        // }
      }
      handleClose();
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationError(error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

Samuel2F, [6/27/2024 4:42 PM]
return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>
        {currentChannel ? "Edit Channel" : "Add Channel"}
      </DialogTitle>
      <DialogContent>
        {currentChannel ? (
          <>
            {/* {ability?.can("update", "Channel", "name") && ( */}
            <TextField
              label="Channel Name"
              name="name"
              value={formData.name  ""}
              onChange={handleChange}
              fullWidth
            />
            {/* )} */}
            {/* {ability?.can("update", "Channel", "isActive") && ( */}
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive  false}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
            {/* )} */}
          </>
        ) : (
          <>
            <TextField
              label="Channel Name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              fullWidth
            />
          </>
        )}

        {validationError && <p style={{ color: "red" }}>{validationError}</p>}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {currentChannel
            ? isSaving
              ? "Updating..."
              : "Update"
            : isSaving
            ? "Adding..."
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChannelForm;