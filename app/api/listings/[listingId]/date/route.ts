import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function PUT(
  req: Request,
  { params }: { params: { listingId: string } }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { listingId } = params;
  const body = await req.json();
  const { tournamentDate } = body;

  if (!tournamentDate) {
    return new NextResponse("Missing tournamentDate", { status: 400 });
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return new NextResponse("Listing not found", { status: 404 });
    }

    if (listing.userId !== currentUser.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: { tournamentDate: new Date(tournamentDate) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ Failed to update tournament date:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
