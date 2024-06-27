// import React from "react";
// import ProgramManagement from "@/components/programs/ProgramManagement";
// import withAuth from "@/hoc/withAuth";

// const Programs: React.FC<{ user: any }> = ({ user }) => {
//   return <ProgramManagement user={user} />;
// };

// export default withAuth(Programs);
import { Box, Paper } from "@mui/material"
// import PagesHeader from "@/components/PagesHeader"
// import { ModalProvider } from "@/components/programComponents/ModalContext"
// import { db } from "@/db"
// import ProgramForm from "@/components/programComponents/ProgramForm"
// import {
//   getAdminData,
//   getCategories,
//   getChannels,
//   getTypes,
// } from "@/actions/programActions"
// import Table from "@/components/programComponents/ProgramTable"
// import UpdateForm from "@/components/programComponents/UpdateForm"
import { getServerSession } from "next-auth"
import { options } from "@/app/api/auth/[...nextauth]/options"

const Program = async ({ searchParams }: any) => {
  // const channels = await getChannels()
  // const type = await getTypes()
  // const category = await getCategories()

  const session = await getServerSession(options)
  // const data = await getAdminData(searchParams, session?.user as any)

  return (
    // <Paper sx={{ padding: 1 }}>
    <Box
      sx={{
        position: "relative",
        overflow: "auto",
        maxWidth: "calc(100vw - 18vw)",
        boxShadow: "2px 2px 10px 5px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* <ModalProvider>
          <PagesHeader />
          <Table {...data} />
          <ProgramForm categorys={category} channels={channels} types={type} />
          <UpdateForm categorys={category} channels={channels} types={type} />
        </ModalProvider> */}
    </Box>
    // </Paper>
  )
}

export default Program
