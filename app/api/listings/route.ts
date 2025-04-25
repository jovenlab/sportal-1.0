import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";

export async function POST(
    request: Request
) {
    const currentUser = await getCurrentUser();

    if(!currentUser){
        return NextResponse.error();
    }

    const body = await request.json();

    const {
        title,
        description,
        imageSrc,
        roomCount,
        bathroomCount,
        category,
        guestCount,
        location,
        price,
        tournamentDate
    } = body;


    // Object.keys(body).forEach((value:any) => {
    //     if(!body[value]){
    //         NextResponse.error();
    //     }
    // });

      // ✅ Validate tournamentDate
    const isValidDate = (str: string) => !isNaN(Date.parse(str));
    const isPastDate = (str: string) => new Date(str) < new Date(new Date().toDateString());

    if (!isValidDate(tournamentDate) || isPastDate(tournamentDate)) {
        return NextResponse.json(
        { error: "Tournament date must be a valid future date." },
        { status: 400 }
        );
    }

    const listing = await prisma.listing.create({
        data:{
            title,
            description,
            imageSrc,
            category,
            roomCount,
            bathroomCount,
            guestCount,
            tournamentDate,
            locationValue: location.value,
            price: parseInt(price,10),
            userId: currentUser.id
        }
    });

    return NextResponse.json(listing)


}