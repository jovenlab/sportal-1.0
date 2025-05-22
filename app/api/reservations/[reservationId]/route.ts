import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  reservationId?: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { reservationId } = params;

  if (!reservationId || typeof reservationId !== "string") {
    return new NextResponse("Invalid reservation ID", { status: 400 });
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { listing: true },
    });

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 });
    }

    const isOwner =
      reservation.userId === currentUser.id ||
      reservation.listing.userId === currentUser.id;

    if (!isOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 🛑 Prevent deleting participants after tournament starts
    const now = new Date();
    const tournamentDate = new Date(reservation.listing.tournamentDate);

    if (tournamentDate <= now) {
      return new NextResponse("Tournament has already started", {
        status: 403,
      });
    }

    // ✅ Proceed with deletion
    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ DELETE reservation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
