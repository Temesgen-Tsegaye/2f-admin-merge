import React from "react";
import ChannelManagement from "@/components/channels/ChannelManagement";
import withAuth from "@/hoc/withAuth";

const Channels: React.FC<{ user: any }> = ({ user }) => {
  return <ChannelManagement user={user} />;
};

export default withAuth(Channels);
