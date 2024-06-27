import React from "react";
import RoleManagement from "@/components/roles/RoleManagement";
import withAuth from "@/hoc/withAuth";

const Roles: React.FC = () => {
  return <RoleManagement />;
};

export default withAuth(Roles);
