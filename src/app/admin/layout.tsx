import React, { Suspense } from "react";
import AdminNav from "@/components/AdminNav";
import AdminMenu from "@/components/AdminMenu";
import { Box } from "@mui/material";
import Loading from "../loading";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box>
      <AdminNav />
      <Box sx={{ display: "flex" }}>
        <AdminMenu />
          <Box sx={{ flex: 1, margin: "60px 30px" }}>{children}</Box>
      </Box>
    </Box>
  );
};
export default layout;
