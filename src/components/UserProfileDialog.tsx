"use client"

import React, { useCallback, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogActions,
  Avatar,
  Typography,
  Button,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
// import { useProgramsContext } from "@/context/ProgramsContext";

interface UserProfileDialogProps {
  open: boolean
  onClose: () => void
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  open,
  onClose,
}) => {
  // const { state } = useProgramsContext();

  // const { user } = state;

  const router = useRouter()

  const signOutUser = async () => {
    await signOut({ callbackUrl: "/", redirect: true })
  }

  const { data: session } = useSession()
  const user = useMemo(() => {
    return session?.user
  }, [session?.user])

  const getAbility = useCallback(async () => {
    if (user) {
      console.log(user)
    }
  }, [user])

  useEffect(() => {
    getAbility()
  }, [getAbility])
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          position: "absolute",
          top: 10,
          right: 10,
          margin: 0,
          minWidth: "200px",
        },
      }}
    >
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ width: 56, height: 56, marginBottom: "8px" }} />
        <Typography variant="h6" sx={{ marginBottom: "8px" }}>
          {user ? user.email : ""}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: "16px" }}>
          {user ? user.email : ""}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={signOutUser} color="warning">
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserProfileDialog
