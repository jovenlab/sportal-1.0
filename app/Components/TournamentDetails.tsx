"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from 'next/navigation';
import { SafeListing, SafeReservations, SafeUser } from "@/app/types";
import Container from "@/app/Components/Container";
import ListingHead from "@/app/Components/listings/ListingHead";
import ListingInfo from "@/app/Components/listings/ListingInfo";
import RoundRobin from "@/app/Components/RoundRobin"; // Adjust path as needed
import SingleElim from "@/app/Components/SingleElim"; // Import SingleElim
import { categories } from "@/app/Components/Navbar/Categories";
import { formatISO } from "date-fns";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import axios from "axios";

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
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date(listing.tournamentDate));

  const handleDateUpdate = async () => {
    try {
      await axios.put(`/api/listings/${listing.id}/date`, {
        tournamentDate: formatISO(selectedDate),
      });
      toast.success("Tournament date updated");
      router.refresh();
    } catch (err) {
      toast.error("Failed to update date");
    }
  };

  const teamNames = reservations
    .map((res) => res.teamName)
    .filter((name, i, arr) => !!name && arr.indexOf(name) === i);

  const category = useMemo(() => {
    return categories.find((item) => item.label === listing.category);
  }, [listing.category]);

  const handleDelete = async (reservationId: string) => {
    try {
      await axios.delete(`/api/reservations/${reservationId}`);
      toast.success('Participant deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete participant');
    }
  };

  const handleEdit = (reservationId: string) => {
    toast('Edit feature not implemented yet');
  };

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col">
          {" "}
          {/* Adjusted gap for better spacing */}
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
          {currentUser?.id === listing.user.id && (
            <div className="my-6 flex items-center gap-4">
              <label className="text-lg font-medium">Tournament Start Date:</label>
              <DatePicker
                value={dayjs(selectedDate)}
                onChange={(date) => setSelectedDate(date?.toDate() || new Date())}
                showTime
              />
              <button
                onClick={handleDateUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Update Date
              </button>
            </div>
          )}
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
                  <tr
                    key={res.id}
                    className="hover:bg-gray-50 transition duration-200"
                  >
                    <td className="p-4 border font-medium text-gray-800">{res.teamName || "-"}</td>
                    <td className="p-4 border text-gray-700">{res.teamRepName || "-"}</td>
                    <td className="p-4 border text-gray-700">{res.teamRepRole || "-"}</td>
                    <td className="p-4 border text-gray-700">{res.contactNumber || "-"}</td>
                    <td className="p-4 border text-gray-700">{res.emailAddress || "-"}</td>
                    {currentUser?.id === listing.user.id && (
                      <td className="p-4 border text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(res.id)}
                            className="px-3 py-1 text-sm rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(res.id)}
                            className="px-3 py-1 text-sm rounded-md text-red-600 bg-red-100 hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-10">
            {listing.tournamentType === 'ROUND_ROBIN' && (
              <RoundRobin
                teamNames={teamNames}
                listingId={listing.id}
                currentUserId={currentUser?.id}
                listingOwnerId={listing.user.id}
                tournamentDate={listing.tournamentDate.toISOString()}
                tournamentType={listing.tournamentType}
              />
            )}
            {listing.tournamentType === 'SINGLE_ELIMINATION' && (
              <SingleElim 
                teams={teamNames}
                listingId={listing.id}
                // Add other props if SingleElim needs data from TournamentDetails
              />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default TournamentDetails;
