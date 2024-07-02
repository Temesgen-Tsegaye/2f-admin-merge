import { fetchChannels } from "@/actions/channelAction";
import { options } from "@/app/api/auth/[...nextauth]/options";
import ChannelManagement from "@/components/channels/ChannelManagement";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const ChannelPage = async ({ searchParams }: any) => {
  const session = await getServerSession(options);
  if (!session) {
    redirect("/");
  }
  console.log("session", session);
  console.log(searchParams);
  const { records, totalRowCount } = await fetchChannels(
    searchParams,
    session?.user
  );
  return (
    <div>
      <ChannelManagement
        data={records}
        totalRowCount={totalRowCount}
        user={session?.user}
      />
    </div>
  );
};

export default ChannelPage;
