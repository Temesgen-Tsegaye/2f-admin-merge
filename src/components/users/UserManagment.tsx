"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
} from "material-react-table";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  lighten,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { ZodError } from "zod";

import {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
} from "@/actions/userActions";

import { AppAbility, defineAbilitiesFor } from "@/lib/abilities";
import { UserWithPermission } from "@/types/types";
import { getAllRoles } from "@/actions/roleActions";

import Loading from "@/app/loading";
import { useSnackbar } from "notistack";
import { userSchema } from "@/validation/user";

interface Setter {
  id: number;
  name: string;
}

interface UserManagementProps {
  user: UserWithPermission;
}

const UserManagement: React.FC<UserManagementProps> = ({ user }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedUser, setSelectedUser] = useState<UserWithPermission | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<UserWithPermission>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Setter[]>([]);
  const [users, setUsers] = useState<UserWithPermission[]>([]);

  const [ability, setAbility] = useState<AppAbility | null>(null);
  const [open, setOpen] = useState(false);

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAbilities = async () => {
      const fetchedAbility = await defineAbilitiesFor(user);
      setAbility(fetchedAbility);
    };

    fetchAbilities();
  }, [user]);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllUsers(user);
      if ("error" in response) {
        setIsError(true);
        console.error("Error fetching users:", response.error);
      } else {
        setUsers(response.users as UserWithPermission[]);
      }
    } catch (error) {
      console.error("Unexpected error fetching users:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const fetchRoles = async () => {
      const roles = await getAllRoles();
      setRoles(roles);
    };
    fetchRoles();
  }, []);
  const handleOpen = (user: UserWithPermission | null = null) => {
    setSelectedUser(user);
    setFormData(user ? { ...user } : {});
    setOpen(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setFormData({});
    setValidationError(null);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      
      const parsedData = userSchema.parse(formData);

      if (selectedUser) {
        await updateUser(user, parsedData, selectedUser.id!);
        enqueueSnackbar("User Updated successfully", { variant: "success" });
      } else {
        await createUser(user, parsedData);
        enqueueSnackbar("User Created successfully", { variant: "success" });
      }
      fetchUserData();
      handleClose();
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationError(error.message);
      } else {
        enqueueSnackbar(`Failed to create user`, {
          variant: "error",
        });
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(user, id);
        enqueueSnackbar("User Deleted successfully", { variant: "warning" });
        fetchUserData();
      } catch (error) {
        console.error("Error deleting user:", error);
        enqueueSnackbar("Failed to Deleted User", { variant: "success" });
      }
    }
  };

  const columns = useMemo<MRT_ColumnDef<UserWithPermission>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "Username",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorFn: (row) => row.role?.name || "",
        id: "roleId",
        header: "Role",
        filterVariant: "multi-select",
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: users,
    getRowId: (row) => String(row.id),
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    enableFacetedValues: true,
    enableRowActions: true,
    enableColumnFilterModes: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => handleOpen(row.original)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() => handleDelete(row.original.id!)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbar: ({ table }) => (
      <Box
        sx={(theme) => ({
          backgroundColor: lighten(theme.palette.background.default, 0.05),
          display: "flex",
          gap: "0.5rem",
          p: "8px",
          justifyContent: "space-between",
        })}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
          startIcon={<AddIcon />}
        >
          Add User
        </Button>
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <MRT_GlobalFilterTextField table={table} />
          <MRT_ToggleFiltersButton table={table} />
        </Box>
      </Box>
    ),
  });

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
      <Box sx={{ position: "relative" }}>
        <MaterialReactTable table={table} />

        <Dialog open={open} onClose={handleClose} fullWidth>
          <DialogTitle>{selectedUser ? "Edit User" : "Add User"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Username"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            {!selectedUser && (
              <TextField
                label="Password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                type="text"
              />
            )}

            <FormControl fullWidth margin="normal">
              <TextField
                select
                label="Role"
                name="roleId"
                value={formData.roleId || ""}
                onChange={handleChange}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            {validationError && (
              <Box mt={2}>
                <Alert severity="error">{validationError}</Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} color="primary">
              {selectedUser
                ? isSaving
                  ? "Updating..."
                  : "Update"
                : isSaving
                ? "Adding..."
                : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UserManagement;
