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
        const { 
            listingId, 
            reservationId,
            paymentMethod,
            referenceNumber,
            screenshotUrl 
        } = body;

        if (!listingId || !reservationId || !paymentMethod || !referenceNumber) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify the reservation exists and belongs to the user
        const reservation = await prisma.reservation.findFirst({
            where: {
                id: reservationId,
                userId: currentUser.id,
                listingId: listingId
            }
        });

        if (!reservation) {
            return new NextResponse("Reservation not found or unauthorized", { status: 404 });
        }

        // Create payment confirmation record
        const paymentConfirmation = await prisma.paymentConfirmation.create({
            data: {
                userId: currentUser.id,
                listingId,
                reservationId,
                paymentMethod,
                referenceNumber,
                screenshotUrl: screenshotUrl || "pending-upload", // Store base64 data temporarily
                status: 'PENDING', // Will be updated by admin
            }
        });

        return NextResponse.json(paymentConfirmation);
    } catch (error) {
        console.error("[PAYMENT_CONFIRMATION]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 