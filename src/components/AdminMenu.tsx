// "use client";

// import React, { useCallback, useEffect, useMemo } from "react";
// import { usePathname } from "next/navigation";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import LiveTvIcon from "@mui/icons-material/LiveTv";
// import MovieFilterIcon from "@mui/icons-material/MovieFilter";
// import { Box, Button } from "@mui/material";
// import Link from "next/link";
// import { defineAbilitiesFor } from "@/lib/abilities";
// import { useSession } from "next-auth/react";

// // import { useProgramsContext } from "@/context/ProgramsContext";

// const AdminMenu: React.FC = () => {
//   const pathname = usePathname();
//   // const { state } = useProgramsContext();
//   // const { user } = state;
//   const { data: session } = useSession();
//   const user = useMemo(() => {
//     return session?.user;
//   }, [session?.user]);

//   const getSession = useCallback(async () => {
//     if (user) {
//       console.log(user);
//     }
//   }, [user]);

//   useEffect(() => {
//     getSession();
//   }, [getSession]);

//   const ability = defineAbilitiesFor(user);

//   const buttonStyles = (path: string) => ({
//     width: "100%",
//     backgroundColor: pathname === path ? "#053d75" : "transparent",
//     color: pathname === path ? "#fff" : "inherit",
//     "&:hover": {
//       backgroundColor: "#869eb5",
//       color: "#fff",
//     },
//   });

//   return (
//     <Box
//       sx={{
//         minWidth: "15%",
//         boxShadow: "10px 0px 5px -5px rgba(0, 0, 0, 0.2)",
//         minHeight: "100vh",
//       }}
//     >
//       <Box
//         sx={{
//           position: "fixed",
//           top: 50,
//           left: 0,
//           width: "15%",
//           minHeight: "calc(100vh - 50px)",
//           textAlign: "start",
//           p: 0,
//           mt: 1,
//           zIndex: 10,
//         }}
//       >
//         <Link href="/admin" passHref>
//           <Button
//             variant="text"
//             startIcon={<DashboardIcon />}
//             sx={buttonStyles("/admin")}
//           >
//             Dashboard
//           </Button>
//         </Link>
//         {ability.can("read", "Channel") && (
//           <Link href="/admin/channels" passHref>
//             <Button
//               variant="text"
//               startIcon={<LiveTvIcon />}
//               sx={buttonStyles("/admin/channels")}
//             >
//               Channels
//             </Button>
//           </Link>
//         )}
//         <Link href="/admin/programs" passHref>
//           <Button
//             variant="text"
//             startIcon={<MovieFilterIcon />}
//             sx={buttonStyles("/admin/programs")}
//           >
//             Programs
//           </Button>
//         </Link>
//         {/* {ability.can("read", "User") && (
//           <Link href="/users" passHref>
//             <Button
//               variant="text"
//               startIcon={<MovieFilterIcon />}
//               sx={buttonStyles("/users")}
//             >
//               Users
//             </Button>
//           </Link>
//         )} */}
//       </Box>
//     </Box>
//   );
// };

// export default AdminMenu;

"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import DashboardIcon from "@mui/icons-material/Dashboard"
import LiveTvIcon from "@mui/icons-material/LiveTv"
import MovieFilterIcon from "@mui/icons-material/MovieFilter"
import { Box, Button } from "@mui/material"
import Link from "next/link"
import { AppAbility, defineAbilitiesFor } from "@/lib/abilities"
import { UserWithPermission } from "@/types/types"
import { useSession } from "next-auth/react"

function AdminMenu() {
  const pathname = usePathname()

  const { data: session } = useSession()

  const user = useMemo(() => {
    return session?.user
  }, [session?.user])

  const getSession = useCallback(async () => {
    if (user) {
      console.log(user)
    }
  }, [user])

  useEffect(() => {
    getSession()
  }, [getSession])

  const [ability, setAbility] = useState<AppAbility | null>(null)

  useEffect(() => {
    const fetchAbilities = async () => {
      const fetchedAbility = await defineAbilitiesFor(
        user as UserWithPermission
      )
      console.log("dkjghdkjghkdfhkdjf", fetchedAbility)
      setAbility(fetchedAbility) // Store the fetched ability in state
    }

    fetchAbilities()
  }, [user])

  const buttonStyles = (path: string) => ({
    width: "100%",
    backgroundColor: pathname === path ? "#053d75" : "transparent",
    color: pathname === path ? "#fff" : "inherit",
    "&:hover": {
      backgroundColor: "#869eb5",
      color: "#fff",
    },
  })

  return (
    <Box
      sx={{
        minWidth: "15%",
        boxShadow: "10px 0px 5px -5px rgba(0, 0, 0, 0.2)",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          top: 50,
          left: 0,
          width: "15%",
          minHeight: "calc(100vh - 50px)",
          textAlign: "start",
          p: 0,
          mt: 1,
          zIndex: 10,
        }}
      >
        <Link href="/admin" passHref>
          <Button
            variant="text"
            startIcon={<DashboardIcon />}
            sx={buttonStyles("/admin")}
          >
            Dashboard
          </Button>
        </Link>

        {ability?.can("read", "Channel") && (
          <Link href="/admin/channels" passHref>
            <Button
              variant="text"
              startIcon={<LiveTvIcon />}
              sx={buttonStyles("/admin/channels")}
            >
              Channels
            </Button>
          </Link>
        )}
        {ability?.can("read", "Program") && (
          <Link href="/admin/programs" passHref>
            <Button
              variant="text"
              startIcon={<MovieFilterIcon />}
              sx={buttonStyles("/admin/programs")}
            >
              Programs
            </Button>
          </Link>
        )}
        {ability?.can("manage", "all") && (
          <>
            <Link href="/admin/users" passHref>
              <Button
                variant="text"
                startIcon={<MovieFilterIcon />}
                sx={buttonStyles("/admin/users")}
              >
                Users
              </Button>
            </Link>
            <Link href="/admin/roles" passHref>
              <Button
                variant="text"
                startIcon={<MovieFilterIcon />}
                sx={buttonStyles("/admin/roles")}
              >
                Roles
              </Button>
            </Link>
          </>
        )}
      </Box>
    </Box>
  )
}

export default AdminMenu
