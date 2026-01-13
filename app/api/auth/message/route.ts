// app/api/auth/message/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Save to Prisma
    const msg = await prisma.message.create({
      data: {
        sender: body.sender,
        receiver: body.receiver,
        text: body.text,
        image: body.image,
        // Prisma field is createdAt
        // createdAt: body.timestamp ? new Date(body.timestamp) : undefined,
      },
    });

    // Return message with `timestamp` as number for Redux
    return NextResponse.json({
      id: msg.id,
      sender: msg.sender,
      receiver: msg.receiver,
      text: msg.text || undefined,
      image: msg.image || undefined,
      // timestamp: msg.createdAt.getTime(), // number for slice
    });
  } catch (err) {
    console.error("Error in POST /api/auth/message:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
