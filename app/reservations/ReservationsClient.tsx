'use client'
import {toast} from "react-hot-toast";
import axios from "axios";
import {useCallback, useState} from "react";
import {useRouter} from "next/navigation";
import React from 'react';

import {SafeReservations, SafeUser} from "../types";

import Heading from "../Components/Heading";
import Container from "../Components/Container";
import ListingCard from "../Components/listings/ListingCard";

interface ReservationsClientProps{
    reservations: SafeReservations[];
    currentUser?: SafeUser | null;
}

const ReservationsClient: React.FC<ReservationsClientProps> = ({
    reservations,
    currentUser
}) => {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState('');

    const onCancel = useCallback((id: string) => {
        setDeletingId(id);

        axios.delete(`/api/reservations/${id}`)
        .then(()=>{
            toast.success("Reservations cancelled");
            router.refresh();
        })
        .catch(()=>{
            toast.error("Something went wrong");
        })
        .finally(()=>{
            setDeletingId('');
        })

    },[router]);
  return (
    <Container>
        <Heading
            title="Tournament Reservations"
            subtitle="Bookings on your tournaments"
        />
        <div className='
                mt-10
                grid
                grid-cols-1
                sm:grid-cols-2
                md:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-5
                2xl:grid-cols-6
                gap-8
        '>
            {reservations.map((reservation)=>(
                <ListingCard
                    key={reservation.id}
                    data={reservation.listing}
                    reservation={reservation}
                    actionId={reservation.id}
                    onAction={onCancel}
                    disabled={deletingId === reservation.id}
                    actionLabel="Cancel guest registration"
                    currentUser={currentUser}
                />
            ))}
        </div>
    </Container>
  )
}

export default ReservationsClient