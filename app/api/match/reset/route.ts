import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
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

    // Get the listing to check ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return new NextResponse("Listing not found", { status: 404 });
    }

    // Check if current user is the tournament creator
    if (listing.userId !== currentUser.id) {
      return new NextResponse("Forbidden: Not tournament owner", { status: 403 });
    }

    // Update all matches for this listing to PENDING
    await prisma.match.updateMany({
      where: { listingId },
      data: { result: "PENDING" },
    });

    return NextResponse.json({ message: "All matches reset successfully" });
  } catch (error) {
    console.error("Error resetting matches:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 