// import { db } from "@/db"
// import { NextResponse } from "next/server"

// export async function POST(req: Request) {
//   try {
//     const body = await req.json()
//     const { email, name, password, roleId } = body
//     //check if email exists

//     const existingUser = await db.user.findFirst({
//       where: {
//         email,
//       },
//     })

//     if (existingUser) {
//       return NextResponse.json(
//         { user: null, message: "user alredy exist" },
//         { status: 409 }
//       )
//     }

//     const newUser = await db.user.create({
//       data: {
//         roleId,
//         email,
//         name,
//         password,
//       },
//     })

//     return NextResponse.json(
//       { user: newUser, message: "user created" },
//       { status: 201 }
//     )
//   } catch (error: unknown) {
//     let errorMessage = "An unknown error occurred"
//     if (error instanceof Error) {
//       errorMessage = error.message
//     }
//     return NextResponse.json(
//       { message: "An error occurred: " + errorMessage },
//       { status: 500 }
//     )
//   }
// }
