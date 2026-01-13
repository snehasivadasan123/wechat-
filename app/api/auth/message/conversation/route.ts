import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("yesss")
  const { user1, user2 } = await req.json();

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    },
    // orderBy: { timestamp: "asc" },
  });

  return NextResponse.json(messages);
}
