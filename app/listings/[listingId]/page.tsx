//You reserve here if tournament not started yet
import React from 'react'
import getListingById from '@/app/actions/getListingById';
import ClientOnly from '@/app/Components/ClientOnly';
import EmptyState from '@/app/Components/EmptyState';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ListingClient from './ListingClient';
import getReservations from '@/app/actions/getReservations';
import FeedbackComponent from '@/app/Components/Feedback';

interface IParams{
    listingId?: string;
}

const ListingPage = async ({params}: {params: IParams}) => {
    const listing = await getListingById(params);
    const reservations = await getReservations(params);
    const currentUser = await getCurrentUser();

    if(!listing){
        return (
            <ClientOnly>
                <EmptyState/>
                <FeedbackComponent />
            </ClientOnly>
        )
    }

  return (
    <ClientOnly>   
        <ListingClient
            listing={listing}
            reservations={reservations}
            currentUser={currentUser}
        />
        <FeedbackComponent />
    </ClientOnly>
  );
}

export default ListingPage