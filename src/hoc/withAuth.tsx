// import { useRouter } from "next/navigation";
// import { useProgramsContext } from "@/context/ProgramsContext";
// import React, { useEffect } from "react";

// const withAuth = (Component: React.FC<any>) => {
//   return (props: any) => {
//     const { state } = useProgramsContext();
//     const { user } = state;
//     const router = useRouter();

//     useEffect(() => {
//       if (!user) {
//         router.push("/");
//       }
//     }, [user, router]);

//     if (!user) {
//       return null;
//     }

//     return <Component {...props} user={user} />;
//   };
// };

// export default withAuth;
