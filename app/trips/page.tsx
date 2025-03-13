import EmptyState from "../Components/EmptyState";
import ClientOnly from "../Components/ClientOnly";

import getCurrentUser from "../actions/getCurrentUser";
import getReservations from "../actions/getReservations";
import TripsClient from "./TripsClient";

const TripsPage = async () => {
    const currentUser = await getCurrentUser();

    if(!currentUser){
        return (
            <ClientOnly>
                <EmptyState
                    title="Unauthorized"
                    subtitle="You need to be logged in to view this page."
                />
            </ClientOnly>
        )
    }

    const reservations = await getReservations({
        userId: currentUser.id
    });

    if(reservations.length === 0){
        return (
            <ClientOnly>
                <EmptyState
                    title="No tournaments found"
                    subtitle="You haven't joined any tournaments yet."
                />
            </ClientOnly>

        )
    }
    return (
        <ClientOnly>
            <TripsClient
                reservations={reservations}
                currentUser={currentUser}
            />
        </ClientOnly>
    )

}


export default TripsPage