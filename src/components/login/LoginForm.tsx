"use client"
import React, { useState } from "react"
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
} from "@mui/material"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import PermIdentityIcon from "@mui/icons-material/PermIdentity"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { loginSchema } from "@/schema"
import { useSession, signIn } from "next-auth/react"
// import { useProgramsContext } from "@/context/ProgramsContext"
// import { setUserInLocalStorage } from "@/utils/localStorageHelpers"
// import { loginUser } from "@/server-actions/userActions"

type FormData = {
  email: string
  password: string
}

const LoginForm: React.FC = () => {
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
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      })

      if (result?.error) {
        console.error(result.error, "Failed to sign in")
        return
      } else {
        router.push("/admin")
      }

      //   //   const { success, user } = await loginUser({ username, password })
      //   if (!success || !user) {
      //     setError("Invalid username or password")
      //     setTimeout(() => {
      //       setError("")
      //     }, 1000)
      //   } else {
      //     setUserInLocalStorage(user, 24)
      //     dispatch({ type: "SET_USER", payload: user })
      //     router.push("/dashboard")
      //   }
      //   console.log(user)
    } catch (error) {
      console.error("Login failed:", error)
      setError("An error occurred during login")
    }
  }

  //   const onSubmit = async (values: z.infer<typeof loginSchema>) => {
  //     const result = await signIn("credentials", {
  //       email: values.email,
  //       password: values.password,
  //       redirect: false,
  //     })
  //     if (result?.error) {
  //       console.error(result.error, "Failed to sign in")
  //       return
  //     } else {
  //       router.push("/admin")
  //     }
  //   }

  //   const onClick = () => {
  //     router.push("/tvNetworks")
  //   }

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
          LOGIN
        </Button>
      </form>
      <Box
        sx={{
          display: "inline-block",
          color: "white",
          marginTop: "50px",
          bottom: 10,
          right: 45,
          backgroundColor: "#3c3e42",
          borderRadius: "5px",
          "&:hover": {
            backgroundColor: "#252b2b",
          },
        }}
      >
        <Button
          //   onClick={onClick}
          sx={{
            color: "white",
          }}
        >
          for customer
        </Button>
      </Box>
    </Box>
  )
}

export default LoginForm
