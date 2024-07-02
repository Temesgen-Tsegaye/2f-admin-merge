import { options } from "@/app/api/auth/[...nextauth]/options";
import UserManagement from "@/components/users/UserManagment";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const UserPage = async () => {
  const session = await getServerSession(options)
  if (!session) {
    redirect("/")
  }
  console.log("session", session)
 
  return (
    <div>
      <UserManagement user={session?.user}/>
    </div>
  );
};

export default UserPage;


