"use client";

import React, { use, useEffect, useState } from "react";
import DashboardCountCard from "./DashboardCountCard";
import { countChannels } from "@/actions/channelAction";
// import { useSocket } from "@/utils/socketUtils";
import  {socket} from "../../utils/socket-cleint"

const ChannelCount: React.FC = () => {
  const [channelCount, setChannelCount] = useState<number>(0);

  const fetchChannelCount = async () => {
    try {
      const { count } = await countChannels();
      setChannelCount(count);
    } catch (error) {
      console.error("Error fetching channel count:", error);
    }
  };
  useEffect(() => {

    socket.on("addChannel", async (data: any) => {

      setChannelCount(data)
    })
    fetchChannelCount();
    return () => {
      socket.off("addChannel");
    };
  }, []);
  // useSocket("channelsUpdated", fetchChannelCount);

  return (
    <DashboardCountCard
      title="Channels"
      value={channelCount}
      change="+12% This Month"
    />
  );
};

export default ChannelCount;
