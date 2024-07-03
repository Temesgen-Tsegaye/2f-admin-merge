import { fetchPrograms } from "@/actions/programActions";
import { options } from "@/app/api/auth/[...nextauth]/options";
import ProgramManagement from "@/components/programs/ProgramManagement";
import { UserWithPermission } from "@/types/types";
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
    session?.user as UserWithPermission
  );
  return (
    <div>
      <ProgramManagement
        data={records}
        totalRowCount={totalRowCount}
        user={session?.user as UserWithPermission}
      />
    </div>
  );
};

export default ProgramPage;
