import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { listingId } = body;

    if (!listingId) {
      console.error("🚫 listingId missing in request body");
      return new NextResponse("Missing listingId", { status: 400 });
    }

    console.log("✅ Received listingId:", listingId);

    const existingMatch = await prisma.match.findFirst({
      where: { listingId },
    });

    if (existingMatch) {
      console.warn("⚠️ Matches already exist for this listing");
      return new NextResponse("Matches already exist", { status: 409 });
    }

    const reservations = await prisma.reservation.findMany({
      where: { listingId },
    });

    if (!reservations || reservations.length < 2) {
      console.warn("⚠️ Not enough teams to generate a bracket");
      return new NextResponse("Not enough teams", { status: 400 });
    }

    const teams = reservations.map((res) => res.teamName).filter(Boolean);

    const matchCreatePromises = [];

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matchCreatePromises.push(
          prisma.match.create({
            data: {
              teamA: teams[i]!,
              teamB: teams[j]!,
              result: "PENDING", // Optional default
              listingId,
            },
          })
        );
      }
    }

    await Promise.all(matchCreatePromises);

    console.log(`✅ ${matchCreatePromises.length} matches generated`);
    return NextResponse.json({ success: true, count: matchCreatePromises.length });
  } catch (err: any) {
    console.error("❌ Server Error in /api/match/generate:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
