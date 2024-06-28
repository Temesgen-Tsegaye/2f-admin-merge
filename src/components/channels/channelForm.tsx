"use client";

import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import { ChannelData } from "@/types/types";
import { AppAbility } from "@/lib/abilities";

interface ChannelDialogProps {
  open: boolean;
  currentChannel: ChannelData | null;
  formData: Partial<ChannelData>;
  validationError: string | null;
  ability: AppAbility | null;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSwitchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClose: () => void;
  handleSubmit: () => void;
}

const ChannelDialog: React.FC<ChannelDialogProps> = ({
  open,
  currentChannel,
  formData,
  validationError,
  ability,
  handleChange,
  handleSwitchChange,
  handleClose,
  handleSubmit,
}) => {
  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>
        {currentChannel ? "Edit Channel" : "Add Channel"}
      </DialogTitle>
      <DialogContent>
        {currentChannel ? (
          <>
            {ability?.can("update", "Channel", "name") && (
              <TextField
                label="Channel Name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                fullWidth
              />
            )}
            {ability?.can("update", "Channel", "status") && (
              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.status || false}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Box>
            )}
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

        {validationError && (
          <p style={{ color: "red" }}>{validationError}</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>
          {currentChannel ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChannelDialog;
