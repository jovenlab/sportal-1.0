'use client';

import { useRouter } from 'next/navigation';
import axios from "axios";

import Container from '../Components/Container';
import Heading from '../Components/Heading';
import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast';
import ListingCard from '../Components/listings/ListingCard';

import { SafeReservations, SafeUser } from '../types';

interface TripsClientProps{
    reservations: SafeReservations[];
    currentUser: SafeUser | null;
}

const TripsClient: React.FC<TripsClientProps> = ({
    reservations,
    currentUser
}) => {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState('');

    const onCancel = useCallback((id: string)=>{
        setDeletingId(id);

        axios.delete(`/api/reservations/${id}`)
        .then(()=>{
            toast.success('Reservation cancelled');
            router.refresh();
        })
        .catch((error)=>{
            toast.error(error?.response?.data?.error);
            
        })
        .finally(()=>{
            setDeletingId('');
        });
    },[router]);

  return (
    <Container>
        <Heading
            title="Past Tournaments"
            subtitle="List of your past tournaments"
        />
        <div
            className='
                mt-10
                grid
                grid-cols-1
                sm:grid-cols-2
                md:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-5
                2xl:grid-cols-6
                gap-8
            '
        >
        {reservations.map((reservation)=>(
            <ListingCard
                key={reservation.id}
                data={reservation.listing}
                reservation={reservation}
                actionId={reservation.id}
                onAction={onCancel}
                disabled={deletingId === reservation.id}
                actionLabel="Cancel"
                currentUser={currentUser}
            />
        ))}
        </div>
    </Container>
  );
}

export default TripsClient