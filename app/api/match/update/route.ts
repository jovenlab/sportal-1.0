// app/api/match/update/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { teamA, teamB, result, listingId, matchId, round } = body;

    if (!teamA || !teamB || !result || !listingId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 🛡 Get the tournament (listing) info
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return new NextResponse("Tournament not found", { status: 404 });
    }

    // ✅ Check if current user is the tournament creator
    if (listing.userId !== currentUser.id) {
      return new NextResponse("Forbidden: Not tournament owner", { status: 403 });
    }

    // If matchId is provided, update that specific match
    if (matchId) {
      const match = await prisma.match.findUnique({
        where: { id: matchId }
      });

      if (!match) {
        return new NextResponse("Match not found", { status: 404 });
      }

      const updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: {
          teamA,
          teamB,
          result,
          round: round || match.round,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(updatedMatch);
    }

    // Otherwise, find existing match by teams
    const existingMatch = await prisma.match.findFirst({
      where: {
        listingId,
        OR: [
          { teamA, teamB },
          { teamA: teamB, teamB: teamA },
        ],
      },
    });

    if (existingMatch) {
      const updatedMatch = await prisma.match.update({
        where: { id: existingMatch.id },
        data: {
          result,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(updatedMatch);
    } else {
      return new NextResponse("Match not found", { status: 404 });
    }
  } catch (error) {
    console.error("❌ Error updating match:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
