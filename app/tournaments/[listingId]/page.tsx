import getReservations from "@/app/actions/getReservations";
import getListingById from "@/app/actions/getListingById";
import ClientOnly from "@/app/Components/ClientOnly";
import EmptyState from "@/app/Components/EmptyState";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";


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
  
          {reservations.length === 0 ? (
            <p>No reservations yet.</p>
          ) : (
            <table className="w-full text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Team Name</th>
                  <th className="p-2 border">Representative</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Contact</th>
                  <th className="p-2 border">Email</th>
                    {/* <th className="p-2 border">Start Date</th>
                    <th className="p-2 border">End Date</th> */}
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
                    {/* <td className="p-2 border">
                      {new Date(res.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      {new Date(res.endDate).toLocaleDateString()}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </ClientOnly>
    );
  }

