// app/api/match/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return new NextResponse("Missing listingId", { status: 400 });
    }

    const matches = await prisma.match.findMany({
      where: { listingId },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
