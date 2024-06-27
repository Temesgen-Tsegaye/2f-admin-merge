import React from "react";
import Dashboards from "@/components/dashboard/Dashboards";
import withAuth from "@/hoc/withAuth";

const Dashboard: React.FC = () => {
  return <Dashboards />;
};

export default withAuth(Dashboard);
