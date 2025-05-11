import getReservations from "@/app/actions/getReservations";
import getListingById from "@/app/actions/getListingById";
import ClientOnly from "@/app/Components/ClientOnly";
import EmptyState from "@/app/Components/EmptyState";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";
import RoundRobin from "@/app/Components/RoundRobin";


interface IParams {
  listingId?: string;
}

export default async function TournamentPage({
    params
  }: {
    params: { listingId: string };
  }) {
    const currentUser = await getCurrentUser();
    

    if (!currentUser) {
      redirect('/'); // or redirect('/login') if you have a login page
    }
  
    const reservations = await getReservations(params);
    const listing = await getListingById(params);
    const teamNames = reservations.map(res => res.teamName);
    
  
    if (!listing) {
      return (
        <ClientOnly>
          <EmptyState />
        </ClientOnly>
      );
    }
  
    return (
      <ClientOnly>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Tournament Participants</h1>
          <p className="mb-2 text-gray-600">Listing: {listing.title}</p>
          <p className="mb-2 text-gray-600">Category: {listing.category}</p>
          <p className="mb-2 text-gray-600">Type: {listing.tournamentType}</p>
  
          {reservations.length === 0 ? (
            <p>No reservations yet.</p>
          ) : (
            <table className="w-full text-left border text-xl">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Team Name</th>
                  <th className="p-2 border">Representative</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Contact</th>
                  <th className="p-2 border">Email</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id}>
                    <td className="p-2 border">{res.teamName || "-"}</td>
                    <td className="p-2 border">{res.teamRepName || "-"}</td>
                    <td className="p-2 border">{res.teamRepRole || "-"}</td>
                    <td className="p-2 border">{res.contactNumber || "-"}</td>
                    <td className="p-2 border">{res.emailAddress || "-"}</td>

                  </tr>
                
                ))}

              </tbody>
            </table>

          )}
          {listing.tournamentType === "ROUND_ROBIN" && (
            <RoundRobin teamNames={teamNames}/>
          )}
          
        </div>

     
      </ClientOnly>
      
    );

  }

