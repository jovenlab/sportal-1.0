// app/tournaments/[listingId]/page.tsx
import getListingById from "@/app/actions/getListingById";
import getReservations from "@/app/actions/getReservations";
import getCurrentUser from "@/app/actions/getCurrentUser";
import TournamentDetails from "@/app/Components/TournamentDetails"; // make sure the path is correct

interface IParams {
  listingId?: string;
}

const ListingPage = async ({ params }: { params: IParams }) => {
  const listing = await getListingById(params);
  const reservations = await getReservations(params);
  const currentUser = await getCurrentUser();

  if (!listing) {
    return (
      <div className="p-8 text-xl font-medium text-red-500">
        Listing not found
      </div>
    );
  }

  return (
    <TournamentDetails
      listing={listing}
      reservations={reservations}
      currentUser={currentUser}
    />
  );
};

export default ListingPage;
