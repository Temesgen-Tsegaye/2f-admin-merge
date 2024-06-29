// import { fetchUsers } from "@/actions/userActions";
import { options } from "@/app/api/auth/[...nextauth]/options";
import UserManagement from "@/components/users/UserManagment";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const UserPage = async ({searchParams}: any) => {
  const session = await getServerSession(options)
  if (!session) {
    redirect("/")
  }
  console.log("session", session)
  // console.log(searchParams)
  // const {records,totalRowCount}=await fetchUsers(searchParams,session?.user)
  return (
    <div>
      <UserManagement user={session?.user}/>
      {/* <UserManagement data={records} totalRowCount={totalRowCount}/> */}
    </div>
  );
};

export default UserPage;


