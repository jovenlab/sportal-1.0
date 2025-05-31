'use client';
import React, { useCallback, useState, useEffect } from 'react'
import {SafeListing,SafeUser,SafeReservations} from '@/app/types';
import { useMemo } from 'react';
import {categories} from '@/app/Components/Navbar/Categories';
import Container from '@/app/Components/Container';
import ListingHead from '@/app/Components/listings/ListingHead';
import ListingInfo from "@/app/Components/listings/ListingInfo";
import useLoginModal from '@/app/hooks/useLoginModal';
import { useRouter } from 'next/navigation';
import { eachDayOfInterval, differenceInCalendarDays, format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import ListingReservation from '@/app/Components/listings/ListingReservation';
import {Range} from "react-date-range";
import RoundRobin from '@/app/Components/RoundRobin';

const initialDateRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
};

interface ListingClientProps{
    reservations?: SafeReservations[];
    listing:SafeListing & {
        user:SafeUser
    };
    currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ListingClientProps> = ({
    listing,
    reservations = [],
    currentUser
}) => {
    const loginModal = useLoginModal();
    const router = useRouter();

    const disabledDates = useMemo(()=>{
        let dates: Date[] = [];

        reservations.forEach((reservation: any) => {
            const range = eachDayOfInterval({
                start: new Date(reservation.startDate),
                end: new Date(reservation.endDate)
            });

            dates = [...dates, ...range];
        });

        return dates;
    },[reservations]);


    const [isLoading, setIsLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(listing.price);
    const [dateRange, setDateRange] = useState<Range>(initialDateRange);

    const tournamentStarted = useMemo(() => {
        return new Date() >= new Date(listing.tournamentDate);
    }, [listing.tournamentDate]);

    const onCreateReservation = useCallback((formData: any) => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
    
        setIsLoading(true);
    
        axios.post('/api/reservations', {
            totalPrice,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            listingId: listing?.id,
            teamName: formData.teamName,
            teamRepName: formData.teamRepName,
            teamRepRole: formData.teamRepRole,
            contactNumber: formData.contactNumber,
            emailAddress: formData.emailAddress,
            fullName: formData.fullName,
        })
        .then(() => {
            toast.success('Listing reserved!');
            setDateRange(initialDateRange);
            router.push('/trips');
        })
        .catch(() => {
            toast.error('Something went wrong');
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, [
        totalPrice,
        dateRange,
        listing?.id,
        router,
        currentUser,
        loginModal
    ]);
    

    useEffect(()=>{
        if(dateRange.startDate && dateRange.endDate){
            const dayCount = differenceInCalendarDays(
                dateRange.endDate,
                dateRange.startDate
            );
            if(dayCount && listing.price){
                setTotalPrice(dayCount * listing.price);
            }else{
                setTotalPrice(listing.price)
            }
        }
    },[dateRange, listing.price]);


    const category = useMemo(()=>{
        return categories.find((item)=>
        item.label === listing.category);
    },[listing.category]);

  return (
    <Container>
        <div className='max-w-screen-lg mx-auto'>
            <div className='flex flex-col gap-6'>
                <ListingHead
                    title={listing.title}
                    imageSrc={listing.imageSrc}
                    locationValue={listing.locationValue}
                    id={listing.id}
                    currentUser={currentUser}
                />
                <div className='
                    grid
                    grid-cols-1
                    md:grid-cols-7
                    md:gap-10
                    mt-6
                '>
                    {tournamentStarted ? (
                        <>
                            <div className="md:col-span-7">
                                <ListingInfo
                                    user={listing.user}
                                    category={category}
                                    description={listing.description}
                                    localAddress={listing.localAddress}
                                    guestCount={listing.guestCount}
                                    tournamentType={listing.tournamentType}
                                    locationValue={listing.locationValue}
                                    tournamentDate={listing.tournamentDate}
                                />
                            </div>
                            <div className="md:col-span-7">
                                <RoundRobin
                                    teamNames={reservations.map(r => r.teamName).filter(Boolean)}
                                    listingId={listing.id}
                                    currentUserId={currentUser?.id}
                                    listingOwnerId={listing.user.id}
                                    tournamentDate={listing.tournamentDate.toISOString()}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="md:col-span-4">
                                <ListingInfo
                                    user={listing.user}
                                    category={category}
                                    description={listing.description}
                                    localAddress={listing.localAddress}
                                    guestCount={listing.guestCount}
                                    tournamentType={listing.tournamentType}
                                    locationValue={listing.locationValue}
                                    tournamentDate={listing.tournamentDate}
                                />
                            </div>
                            <div className='
                                order-first
                                mb-10
                                md:order-last
                                md:col-span-3
                            '>
                                {currentUser?.id === listing.user.id && !tournamentStarted && (
                                    <div className="mb-4">
                                        <button
                                            onClick={() => router.push(`/tournaments/${listing.id}`)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow"
                                        >
                                            Begin Tournament
                                        </button>
                                    </div>
                                )}
                                <ListingReservation
                                    price={listing.price}
                                    totalPrice={totalPrice}
                                    onChangeDate={(value) => setDateRange(value)}
                                    dateRange={dateRange}
                                    onSubmit={onCreateReservation}
                                    disabled={isLoading}
                                    disabledDates={disabledDates}
                                    category={listing.category}
                                    listingId={listing.id}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    </Container>
  );
}

export default ListingClient