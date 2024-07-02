"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  SelectChangeEvent,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { validateProgram, Program } from "./programType";
import {
  createProgram,
  updateProgram,
  getProgramById,
} from "@/actions/programActions";
import { AppAbility } from "@/lib/abilities";
import { UserWithPermission } from "@/types/types";
import { subject } from "@casl/ability";
import { Program as PrismaProgram } from "@prisma/client";

interface Setter {
  id: number;
  name: string;
}

interface ProgramFormProps {
  editingProgram: Partial<Program | null>;
  newProgram: Partial<Program>;
  channels: Setter[];
  types: Setter[];
  categories: Setter[];
  openDialog: boolean;
  handleCloseDialog: () => void;
  user: UserWithPermission;
  ability: AppAbility | null;
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  setNewProgram: React.Dispatch<React.SetStateAction<Partial<Program>>>;
}

const ProgramForm: React.FC<ProgramFormProps> = ({
  editingProgram,
  newProgram,
  channels,
  types,
  categories,
  openDialog,
  handleCloseDialog,
  user,
  ability,
  setPrograms,
  setNewProgram,
}) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string | number, string | number | undefined>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setNewProgram({
      ...newProgram,
      [name]: name === "duration" ? Number(value) : value,
    });
  };

  const handleSelectChange = (event: SelectChangeEvent<number>) => {
    const { name, value } = event.target;
    setNewProgram({ ...newProgram, [name]: value });
  };

  const handleSaveProgram = async () => {
    const validationErrors = validateProgram(newProgram);
    if (Object.values(validationErrors).some((error) => error)) {
      setValidationErrors(validationErrors);
      console.log(validationErrors);
      return;
    }
    setIsSaving(true);

    try {
      if (editingProgram && editingProgram.id !== undefined) {
        const { userId } = await getProgramById(editingProgram.id);
        const data = {
          title: newProgram.title,
          duration: newProgram.duration,
          description: newProgram.description,
          videoUrl: newProgram.videoUrl,
          released: newProgram.released,
          isActive: newProgram.status,
          channelId: newProgram.channelId,
          typeId: newProgram.typeId,
          categoryId: newProgram.categoryId,
          userId: userId,
        };
        if (
          ability &&
          ability.can(
            "update",
            subject("Program", { ...editingProgram } as PrismaProgram)
          )
        ) {
          await updateProgram(editingProgram.id, data, user);
          enqueueSnackbar("Program updated successfully", {
            variant: "success",
          });
        } else {
          console.log("not have permission");
          setError("You do not have permission to update this program.");
          enqueueSnackbar(
            "You do not have permission to update this program.",
            { variant: "error" }
          );
        }
      } else {
        const endDate = new Date();
        const randomDays = Math.floor(Math.random() * 30) + 1;
        const released = new Date(endDate);
        released.setDate(released.getDate() - randomDays);

        await createProgram({ ...newProgram, released, userId: user.id }, user);
        enqueueSnackbar("Program created successfully", { variant: "success" });
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving program:", error);
      setIsError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogTitle>
        {editingProgram ? "Edit Program" : "Create New Program"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Title"
              variant="standard"
              name="title"
              value={newProgram.title || ""}
              onChange={handleChange}
              error={!!validationErrors?.title}
              helperText={validationErrors?.title}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Duration"
              variant="standard"
              name="duration"
              type="number"
              value={newProgram.duration?.toString() || ""}
              onChange={handleChange}
              error={!!validationErrors?.duration}
              helperText={validationErrors?.duration}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              variant="standard"
              name="description"
              value={newProgram.description || ""}
              onChange={handleChange}
              error={!!validationErrors?.description}
              helperText={validationErrors?.description}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Video URL"
              variant="standard"
              name="videoUrl"
              type="url"
              value={newProgram.videoUrl || ""}
              onChange={handleChange}
              error={!!validationErrors?.videoUrl}
              helperText={validationErrors?.videoUrl}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="channel-select-label">Channels</InputLabel>
              <Select
                labelId="channel-select-label"
                name="channelId"
                value={newProgram.channelId || ""}
                error={!!validationErrors?.channelId}
                onChange={handleSelectChange}
                label="Channels"
              >
                {channels.map((channel) => (
                  <MenuItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-select-label">Types</InputLabel>
              <Select
                labelId="type-select-label"
                name="typeId"
                value={newProgram.typeId || ""}
                error={!!validationErrors?.typeId}
                onChange={handleSelectChange}
                label="Types"
              >
                {types.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-select-label">Categories</InputLabel>
              <Select
                labelId="category-select-label"
                name="categoryId"
                value={newProgram.categoryId || ""}
                error={!!validationErrors?.categoryId}
                onChange={handleSelectChange}
                label="Categories"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSaveProgram} color="primary" disabled={isSaving}>
          {editingProgram
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

export default ProgramForm;
