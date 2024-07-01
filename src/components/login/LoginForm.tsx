"use client"
import React, { useState } from "react"
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  CircularProgress,
} from "@mui/material"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import PermIdentityIcon from "@mui/icons-material/PermIdentity"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { loginSchema } from "@/schema"
import { useSnackbar } from "notistack"
import { useSession, signIn } from "next-auth/react"
type FormData = {
  email: string
  password: string
}

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [error, setError] = useState<string | null>(null)

  const onSubmit: SubmitHandler<FormData> = async () => {
    const { email, password } = getValues()
    console.log(password)
    try {
      setLoading(true)
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      })

      if (result?.error) {
        enqueueSnackbar(`${result.error} password or email invalid`, {
          variant: "error",
        })
        return
      } else {
        enqueueSnackbar("Login successful", { variant: "success" })
        router.push("/admin")
      }
    } catch (error) {
      console.error("Login failed:", error)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: "40px",
        minHeight: "44vh",
        marginBlock: { xs: "40px" },
      }}
    >
      <Typography variant="h4" fontWeight={600}>
        LOGIN
      </Typography>
      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              variant="outlined"
              placeholder="Email"
              fullWidth
              margin="normal"
              error={!!errors.email?.message}
              helperText={errors.email?.message ?? ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PermIdentityIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              placeholder="password"
              variant="outlined"
              fullWidth
              margin="normal"
              error={!!errors.password?.message}
              helperText={errors.password?.message ?? ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOpenIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            marginTop: 2,
            backgroundColor: "#007bff",
            "&:hover": {
              backgroundColor: "#0056b3",
            },
          }}
        >
          {loading ? <CircularProgress color="inherit" size={25} /> : "LOGIN"}
        </Button>
      </form>
    </Box>
  )
}

export default LoginForm
