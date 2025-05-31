import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return new NextResponse("Missing listingId", { status: 400 });
    }

    // Verify the user owns the tournament
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId
      }
    });

    if (!listing || listing.userId !== currentUser.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete all matches for this listing
    await prisma.match.deleteMany({
      where: {
        listingId: listingId
      }
    });

    return NextResponse.json({ message: "Matches deleted successfully" });
  } catch (error) {
    console.error("[MATCH_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 