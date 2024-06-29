import { prisma } from "../../db/index";

export async function ChannelRealtime(io: any, socket: any) {
  socket.on("addChannel", async (data: any) => {
    io.emit("addChannel", await prisma.channel.count());
  });
}
