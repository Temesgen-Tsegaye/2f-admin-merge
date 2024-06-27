// import React from "react";
// import ChannelManagement from "@/components/channels/ChannelManagement";
// import withAuth from "@/hoc/withAuth";

// const Channels: React.FC<{ user: any }> = ({ user }) => {
//   return <ChannelManagement user={user} />;
// };

// export default withAuth(Channels);
import React from "react"
import { Box } from "@mui/material"
import ChannelTable from "@/components/channels/ChannelTable"

const page = () => {
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
        <ChannelTable />
      </Box>
    </Box>
  )
}

export default page
