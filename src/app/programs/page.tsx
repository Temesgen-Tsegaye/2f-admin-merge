import React from "react";
import ProgramManagement from "@/components/programs/ProgramManagement";
import withAuth from "@/hoc/withAuth";

const Programs: React.FC<{ user: any }> = ({ user }) => {
  return <ProgramManagement user={user} />;
};

export default withAuth(Programs);
