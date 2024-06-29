import { fetchPrograms } from "@/actions/programActions";
import { options } from "@/app/api/auth/[...nextauth]/options";
import ProgramManagement from "@/components/programs/ProgramManagement";
import { defineAbilitiesFor } from "@/lib/abilities";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const ProgramPage = async ({searchParams}: any) => {
  const session = await getServerSession(options)
  if (!session) {
    redirect("/")
  }
  console.log("session", session)
  // console.log(searchParams)

  const {records,totalRowCount}=await fetchPrograms(searchParams,session?.user)
  return (
    <div>
      {/* <ProgramManagement user={session?.user}/> */}
      {/* <ProgramManagement data={records} totalRowCount={totalRowCount} user={session?.user}/> */}
      <ProgramManagement data={records} totalRowCount={totalRowCount} user={session?.user}/>
    </div>
  );
};

export default ProgramPage;

