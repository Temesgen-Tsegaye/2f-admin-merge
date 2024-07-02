import { fetchPrograms } from "@/actions/programActions";
import { options } from "@/app/api/auth/[...nextauth]/options";
import ProgramManagement from "@/components/programs/ProgramManagement";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const ProgramPage = async ({ searchParams }: any) => {
  const session = await getServerSession(options);
  if (!session) {
    redirect("/");
  }
  console.log("session", session);

  const { records, totalRowCount } = await fetchPrograms(
    searchParams,
    session?.user
  );
  return (
    <div>
      <ProgramManagement
        data={records}
        totalRowCount={totalRowCount}
        user={session?.user}
      />
    </div>
  );
};

export default ProgramPage;
