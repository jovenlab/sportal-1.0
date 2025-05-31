import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    console.log("[MATCH_RESET] Received reset request");
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.log("[MATCH_RESET] Unauthorized: No current user");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(`[MATCH_RESET] User ${currentUser.id} is attempting to reset matches.`);
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      console.log("[MATCH_RESET] Bad Request: Missing listingId");
      return new NextResponse("Missing listingId", { status: 400 });
    }

    console.log(`[MATCH_RESET] Attempting to find listing ${listingId}`);
    // Verify the user owns the tournament
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId
      }
    });

    if (!listing || listing.userId !== currentUser.id) {
      console.log(`[MATCH_RESET] Unauthorized: User ${currentUser.id} does not own listing ${listingId}`);
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(`[MATCH_RESET] Listing ${listingId} found and owned by user. Proceeding to reset matches.`);
    // Reset all matches for this listing to PENDING
    await prisma.match.updateMany({
      where: {
        listingId: listingId
      },
      data: {
        result: "PENDING"
      }
    });

    console.log(`[MATCH_RESET] Matches for listing ${listingId} reset successfully.`);
    return NextResponse.json({ message: "Matches reset successfully" });
  } catch (error) {
    console.error("[MATCH_RESET] Internal Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 