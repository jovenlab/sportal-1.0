import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const {
    listingId,
    startDate,
    endDate,
    totalPrice,
    teamName,
    teamRepName,
    teamRepRole,
    contactNumber,
    emailAddress
  } = body;

  if (!listingId || !startDate || !endDate || !totalPrice) {
    return NextResponse.error();
  }

  // Fetch listing to check category
  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId
    }
  });

  if (!listing) {
    return NextResponse.error();
  }

  // Determine team info based on category
  const isBasketball = listing.category === "Basketball";

  const reservation = await prisma.listing.update({
    where: {
      id: listingId
    },
    data: {
      reservations: {
        create: {
          userId: currentUser.id,
          startDate,
          endDate,
          totalPrice,
          teamName: isBasketball ? teamName : "",
          teamRepName: isBasketball ? teamRepName : "",
          teamRepRole: isBasketball ? teamRepRole : "",
          contactNumber: isBasketball ? contactNumber : "",
          emailAddress: isBasketball ? emailAddress : ""
        }
      }
    }
  });

  return NextResponse.json(reservation);
}
