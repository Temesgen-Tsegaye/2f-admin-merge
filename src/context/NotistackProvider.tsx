"use client"
import React from "react"
import { SnackbarProvider as NotistackProvider } from "notistack"

const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NotistackProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      {children}
    </NotistackProvider>
  )
}

export default SnackbarProvider
