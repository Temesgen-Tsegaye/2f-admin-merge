"use client"
import React from "react"
import { SessionProvider } from "next-auth/react"
// Date Picker Imports
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
const AuthProvider = ({ children }: any) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <SessionProvider>{children}</SessionProvider>
    </LocalizationProvider>
  )
}

export default AuthProvider
