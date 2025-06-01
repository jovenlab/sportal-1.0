import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { listingId, tournamentType, teamA, teamB, round } = body;

    if (!listingId) {
      console.error("🚫 listingId missing in request body");
      return new NextResponse("Missing listingId", { status: 400 });
    }

    console.log("✅ Received request:", { listingId, tournamentType, teamA, teamB, round });

    if (tournamentType === 'SINGLE_ELIMINATION') {
      // For single elimination, create a single match with the specified teams
      if (!teamA || !teamB) {
        return new NextResponse("Missing team information", { status: 400 });
      }

      const match = await prisma.match.create({
        data: {
          teamA,
          teamB,
          result: "PENDING",
          listingId,
          round: round || 1, // Default to round 1 if not specified
        },
      });

      return NextResponse.json(match);
    }

    // Round robin tournament logic
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
              result: "PENDING",
              listingId,
              round: 1, // All round robin matches are in round 1
            },
          })
        );
      }
    }

    await Promise.all(matchCreatePromises);

    // ✅ Update tournamentDate only if it's in the future
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (listing && new Date(listing.tournamentDate) > new Date()) {
      await prisma.listing.update({
        where: { id: listingId },
        data: { tournamentDate: new Date() },
      });
      console.log("📆 Tournament start time updated");
    }

    console.log(`✅ ${matchCreatePromises.length} matches generated`);
    return NextResponse.json({
      success: true,
      count: matchCreatePromises.length,
    });
  } catch (err: any) {
    console.error("❌ Server Error in /api/match/generate:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
