'use client';

import React, { useMemo } from "react";
import { SafeListing, SafeReservations, SafeUser } from "@/types";
import Container from "@/app/Components/Container";
import ListingHead from "@/app/Components/listings/ListingHead";
import ListingInfo from "@/app/Components/listings/ListingInfo";
import RoundRobin from "@/app/Components/RoundRobin"; // Adjust path as needed
import { categories } from "@/app/Components/Navbar/Categories";

interface TournamentDetailsProps {
  listing: SafeListing & { user: SafeUser };
  reservations: SafeReservations[];
  currentUser?: SafeUser | null;
}

const TournamentDetails: React.FC<TournamentDetailsProps> = ({
  listing,
  reservations,
  currentUser,
}) => {
  const teamNames = reservations
    .map((res) => res.teamName)
    .filter((name, i, arr) => !!name && arr.indexOf(name) === i);

  const category = useMemo(() => {
    return categories.find((item) => item.label === listing.category);
  }, [listing.category]);

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col"> {/* Adjusted gap for better spacing */}
          <ListingHead
            title={listing.title}
            imageSrc={listing.imageSrc}
            locationValue={listing.locationValue}
            id={listing.id}
            currentUser={currentUser}
          />
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
          <div className="overflow-x-auto mt-10">
            <table className="w-full text-left border text-xl">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 border">Participating Teams</th>
                  <th className="p-4 border">Representative</th>
                  <th className="p-4 border">Role</th>
                  <th className="p-4 border">Contact</th>
                  <th className="p-4 border">Email</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id}>
                    <td className="p-4 border">{res.teamName || "-"}</td>
                    <td className="p-4 border">{res.teamRepName || "-"}</td>
                    <td className="p-4 border">{res.teamRepRole || "-"}</td>
                    <td className="p-4 border">{res.contactNumber || "-"}</td>
                    <td className="p-4 border">{res.emailAddress || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-10">
            <RoundRobin
              teamNames={teamNames}
              listingId={listing.id}
              currentUserId={currentUser?.id}
              listingOwnerId={listing.user.id}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default TournamentDetails;
