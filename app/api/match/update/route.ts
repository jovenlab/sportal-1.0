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
    const { teamA, teamB, result, listingId } = body;

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

    // 🔄 Find existing match (in any order)
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
      await prisma.match.update({
        where: { id: existingMatch.id },
        data: {
          result,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ message: "Match updated", matchId: existingMatch.id });
    } else {
      // Optionally prevent creating if match doesn't exist
      return new NextResponse("Match not found", { status: 404 });
    }
  } catch (error) {
    console.error("❌ Error updating match:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
