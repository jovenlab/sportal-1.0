"use client";

import { useEffect, useState } from "react";
import { mockTournaments } from "../../mockData/mockData";
import type { Tournament, Match } from "../../types";

export default function TournamentPage({ params }: { params: { id: string } }) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const url = window.location.pathname;
    const idMatch = url.match(/\/tournaments\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (!id) return;

    const tournament = mockTournaments.find((t) => t.id === id);
    setTournament(tournament || null);
  }, []);

  const openModal = (match: Match) => {
    setSelectedMatch(match);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setShowModal(false);
  };

  if (!tournament) {
    return (
      <div className="p-6 text-center text-red-500">Tournament not found.</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{tournament.name}</h1>
      <p className="text-gray-700 mb-2">{tournament.description}</p>
      <p className="mb-6 text-sm text-gray-500">
        🗓 <strong>{tournament.startDate}</strong> –{" "}
        <strong>{tournament.endDate}</strong>
      </p>

      {/* Participants */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">👥 Participants</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tournament.participants.map((p) => (
            <li
              key={p.id}
              className="bg-gray-100 px-4 py-2 rounded-md shadow-sm"
            >
              {p.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Matches Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Matches</h2>

        {/* Table View */}
        <div className="hidden md:block">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Match</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Winner</th>
              </tr>
            </thead>
            <tbody>
              {tournament.matches.map((match) => (
                <tr
                  key={match.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => openModal(match)}
                >
                  <td className="py-2 px-4 border-b">
                    {match.team1} vs {match.team2}
                  </td>
                  <td className="py-2 px-4 border-b">{match.date}</td>
                  <td className="py-2 px-4 border-b">
                    {match.winner || (
                      <span className="italic text-gray-500">To Be Played</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card View for Mobile */}
        <div className="md:hidden space-y-4">
          {tournament.matches.map((match) => (
            <div
              key={match.id}
              className="bg-white p-4 rounded shadow-md cursor-pointer"
              onClick={() => openModal(match)}
            >
              <p className="font-semibold">
                {match.team1} vs {match.team2}
              </p>
              <p className="text-sm text-gray-600">Date: {match.date}</p>
              <p className="text-sm">
                Winner:{" "}
                {match.winner || (
                  <span className="italic text-gray-500">To Be Played</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Match Details */}
      {showModal && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Match Details</h3>
            <p>
              <strong>Match:</strong> {selectedMatch.team1} vs{" "}
              {selectedMatch.team2}
            </p>
            <p>
              <strong>Date:</strong> {selectedMatch.date}
            </p>
            <p>
              <strong>Winner:</strong> {selectedMatch.winner || "TBD"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
