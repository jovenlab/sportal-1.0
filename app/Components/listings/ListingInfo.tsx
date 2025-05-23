'use client';
import React from 'react'

import {SafeUser} from "@/app/types";
import { IconType } from 'react-icons';
import useCountries from '@/app/hooks/useCountries';
import Avatar from "../Avatar";
import ListingCategory from './ListingCategory';
import dynamic from "next/dynamic";

const Map = dynamic(()=> import('../Map'),{
    ssr: false
});

type TournamentType = 'ROUND_ROBIN' | 'SINGLE_ELIMINATION';


interface ListingInfoProps{
    user: SafeUser;
    description: string;
    guestCount: number;

    category: {
        icon: IconType;
        label: string;
        description: string;
    } | undefined
    locationValue: string;
    localAddress: string;
    tournamentDate: Date;
    tournamentType: TournamentType;
}

const ListingInfo: React.FC<ListingInfoProps> = ({
    user,
    description,
    guestCount,
    localAddress,
    category,
    locationValue,
    tournamentDate,
    tournamentType
}) => {
    const { getByValue } = useCountries();
    const tournamentTypeLabel = {
    ROUND_ROBIN: 'Round Robin',
    SINGLE_ELIMINATION: 'Single Elimination',
    }[tournamentType];

    const coordinates = getByValue(locationValue)?. latlng;
  return (
    <div className='col-span-4 flex flex-col gap-8'>
        <div className='flex flex-col gap-2'>
            <div className='
                    text-xl
                    font-semibold
                    flex
                    flex-row
                    items-center
                    gap-2
            '>
                <div>Organized by {user?.name}</div>
                <Avatar src={user?.image}/>
            </div>
            <div className='
                    flex
                    flex-row
                    items-center
                    gap-4
                    font-light
                    text-neutral-500
            '>
                <div>
                    {guestCount} teams  
                </div>

                <div>
                    {tournamentDate.toLocaleDateString()} start
                </div>
            </div>
        </div>
        <hr />
        {category && (
            <ListingCategory
                icon={category.icon}
                label={category.label}
                description={category.description}
                tournamentTypeLabel={tournamentTypeLabel}
            />
        )}
        <hr />
        <div className='text-lg font-light text-neutral-500'>
            {description}
        </div>
        <hr />
        <div className='text-lg font-light text-neutral-500'>
            {localAddress}
        </div>
        <Map center={coordinates}/>

    </div>
  );
}

export default ListingInfo