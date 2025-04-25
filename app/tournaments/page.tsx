import Link from 'next/link';
import { mockTournaments } from '../mockData/mockData';
import type { Tournament } from '../types';

async function fetchTournaments(): Promise<Tournament[]> {
  return mockTournaments;
}

export default async function TournamentsPage() {
  const tournaments = await fetchTournaments();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">🏆 Ongoing Tournaments</h1>

      {tournaments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5"
            >
              <Link href={`/tournaments/${tournament.id}`}>
                <h2 className="text-xl font-semibold text-blue-600 hover:underline mb-2">
                  {tournament.name}
                </h2>
              </Link>
              <p className="text-gray-700 mb-2">{tournament.description}</p>
              <p className="text-sm text-gray-500">
                📅 <strong>{tournament.startDate}</strong> – <strong>{tournament.endDate}</strong>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No tournaments available at the moment.</p>
      )}
    </div>
  );
}
