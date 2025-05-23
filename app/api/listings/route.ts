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
        category,
        guestCount,
        location,
        price,
        tournamentDate,
        localAddress,
        tournamentType
    } = body;


    // Object.keys(body).forEach((value:any) => {
    //     if(!body[value]){
    //         NextResponse.error();
    //     }
    // });

    const listing = await prisma.listing.create({
        data:{
            title,
            description,
            imageSrc,
            category,
            guestCount,
            tournamentDate,
            locationValue: location.value,
            localAddress,
            tournamentType,
            price: parseInt(price,10),
            userId: currentUser.id
        }
    });

    return NextResponse.json(listing)


}