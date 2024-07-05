"use client";

import React, { useEffect, Suspense, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import { getAllPermissions, createRole } from "@/actions/userActions";
import { Permission } from "@prisma/client";
import Loading from "@/app/loading";
import { useSnackbar } from "notistack";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { z } from "zod";
import { RoleSchema } from "@/validation/role";

const RoleManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathName = usePathname();

  const name = searchParams.get("name") || "";
  const selectedPermissions = JSON.parse(
    searchParams.get("permissions") || "[]"
  );
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const permissionsData = await getAllPermissions();
        setPermissions(permissionsData);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        enqueueSnackbar("Failed to fetch permissions", { variant: "error" });
      }
    };

    fetchPermissions();
  }, []);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.replace(`${pathName}?${params.toString()}`, { scroll: false });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const permissionId = parseInt(event.target.value);
    let updatedPermissions;
    if (event.target.checked) {
      updatedPermissions = [...selectedPermissions, permissionId];
    } else {
      updatedPermissions = selectedPermissions.filter(
        (id: number) => id !== permissionId
      );
    }
    updateSearchParams("permissions", JSON.stringify(updatedPermissions));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = { name, permissions: selectedPermissions };

    try {
      RoleSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          enqueueSnackbar(err.message, { variant: "warning" });
        });
      }
      return;
    }
    setIsLoading(true);
    try {
      const createdRole = await createRole(name, selectedPermissions);
      if (createdRole) {
        enqueueSnackbar("Role created successfully", { variant: "success" });
        router.push("/admin/users");
      }
    } catch (error) {
      enqueueSnackbar("Creating role failed", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const groupedPermissions: { [key: string]: Permission[] } = {};
  permissions.forEach((permission: Permission) => {
    if (!groupedPermissions[permission.subject]) {
      groupedPermissions[permission.subject] = [];
    }
    groupedPermissions[permission.subject].push(permission);
  });

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Add New Role
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Role Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => updateSearchParams("name", e.target.value)}
          required
        />
        <Suspense fallback={<Loading />}>
          {Object.keys(groupedPermissions).map((subject) => (
            <Paper
              elevation={3}
              style={{ marginBottom: "10px", padding: "10px" }}
              key={subject}
            >
              <Typography variant="subtitle1" fontSize="24px">
                {subject}
              </Typography>
              <Grid container spacing={2}>
                {groupedPermissions[subject].map((permission) => (
                  <Grid item xs={12} sm={6} key={permission.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={handleCheckboxChange}
                          value={permission.id.toString()}
                        />
                      }
                      label={permission.name}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}
        </Suspense>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: "20px" }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Create Role"}
        </Button>
      </form>
    </Container>
  );
};

export default RoleManagement;
