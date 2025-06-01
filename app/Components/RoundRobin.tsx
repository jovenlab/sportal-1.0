'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Match {
    id: string;
    teamA: string;
    teamB: string;
    result: string;
    listingId: string;
    createdAt: string;
    updatedAt: string;
}

type MatchResult = string | 'DRAW' | null | 'ONGOING' | 'PENDING';

interface ResultsMap {
  [key: string]: MatchResult;
}

interface RoundRobinProps {
    teamNames: string[];
    listingId: string; //to look for specific tournaments
    currentUserId?: string | null;
    listingOwnerId: string;
    tournamentDate: string;
    tournamentType: string;
}

const RoundRobin: React.FC<RoundRobinProps> = ({teamNames, listingId, currentUserId, listingOwnerId, tournamentDate, tournamentType}) => {
  const [title, setTitle] = useState('');
  const tournamentHasStarted = new Date(tournamentDate) <= new Date();
  const [teamsInput, setTeamsInput] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  const [results, setResults] = useState<ResultsMap>({});
  const [modal, setModal] = useState<{ teamA: string, teamB: string, key: string, revKey: string } | null>(null);
  const [resetModal, setResetModal] = useState(false);
  const isOwner = currentUserId === listingOwnerId;
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/match?listingId=${listingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data: Match[] = await response.json();
      setMatches(data);

      // Process fetched data to populate teams and results
      const uniqueTeams = new Set<string>();
      const initialResults: ResultsMap = {};

      data.forEach(match => {
        uniqueTeams.add(match.teamA);
        uniqueTeams.add(match.teamB);
        
        // Use the result field directly from the backend
        const sortedKey = [match.teamA, match.teamB].sort().join('_vs_');
        initialResults[sortedKey] = match.result as MatchResult; 
      });

      // Convert Set to Array and sort teams alphabetically for consistent display
      const sortedTeams = Array.from(uniqueTeams).sort();
      setTeams(sortedTeams);
      setResults(initialResults);

    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [listingId]);

  const generateTables = async () => {
    console.log("✅ Button clicked! Listing ID:", listingId);
    try {
      // Check if matches already exist and delete them if they do
      if (matches.length > 0) {
        const confirmDelete = window.confirm(
          "Matches already exist for this tournament. Do you want to delete them and generate new ones?"
        );
        if (!confirmDelete) {
          return; // User cancelled deletion
        }

        console.log("🗑️ Deleting existing matches for listing:", listingId);
        const deleteResponse = await fetch("/api/match/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listingId }),
        });

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error("❌ Failed to delete existing matches:", errorText);
          toast.error("Failed to delete existing matches. Cannot regenerate.");
          return;
        }
        console.log("🗑️ Existing matches deleted successfully.");
      }

      // Proceed with generating new matches
      const response = await fetch("/api/match/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId }),
      });

      console.log("🛰️ Response status:", response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        toast.error("Failed to Generate Matches: Not Enough Teams");
        return;
      }      
  
      // After successful generation, refetch matches to update the UI
      await fetchMatches();

      toast.success("Matches generated successfully!");

    } catch (error) {
      console.error("Error generating matches", error);
      toast.error("An error occurred while generating matches.");
    }
  };

  const calculateStats = (team: string) => {
    let games = 0, wins = 0, losses = 0, draws = 0;
    const seen = new Set<string>();
    for (const key in results) {
      const [t1, , t2] = key.split('_');
      const matchId = [t1, t2].sort().join('_vs_');
      if (seen.has(matchId)) continue;
      seen.add(matchId);
      if (t1 === team || t2 === team) {
        const result = results[key] || results[`${t2}_vs_${t1}`];
        if (result && result !== 'PENDING') {
          games++;
          if (result === 'DRAW') draws++;
          else if (result === team) wins++;
          else losses++;
        }
      }
    }
    const points = wins * 3 + draws;
    return { games, wins, losses, draws, points };
  };

  const updateResult = async (winner: MatchResult, key: string, revKey: string) => {
    setResults(prev => ({
      ...prev,
      [key]: winner,
      [revKey]: winner,
    }));
  
    setModal(null);
  
    const [teamA, , teamB] = key.split('_');
  
    try {
      await fetch("/api/match/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamA,
          teamB,
          result: winner,
          listingId,
        }),
      });
  
      console.log(`🏆 Match updated: ${teamA} vs ${teamB} → ${winner}`);
    } catch (err) {
      console.error("❌ Failed to update match", err);
    }
  };
  

  const sortedTeamStats = () => {
    return teams.map(team => ({
      team,
      ...calculateStats(team),
    })).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      const key = `${a.team}_vs_${b.team}`;
      const revKey = `${b.team}_vs_${a.team}`;
      const result = results[key] || results[revKey];
      if (result === a.team) return -1;
      if (result === b.team) return 1;
      return 0;
    });
  };

  const renderLeaderboard = () => (
    <div>
      <hr/>
      <h2 className="text-lg font-medium text-sky-500 mb-2 mt-4 border-b border-gray-300 pb-2">Leaderboard</h2>
      <table className="table-auto w-full border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm text-gray-700 bg-white">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="border px-3 py-2 text-center">Team</th>
            <th className="border px-3 py-2 text-center">Games</th>
            <th className="border px-3 py-2 text-center">Wins</th>
            <th className="border px-3 py-2 text-center">Draws</th>
            <th className="border px-3 py-2 text-center">Losses</th>
            <th className="border px-3 py-2 text-center">Points</th>
          </tr>
        </thead>
        <tbody>
          {sortedTeamStats().map(({ team, games, wins, draws, losses, points }, i) => (
            <tr key={i} className="hover:bg-gray-50 transition">
              <td className="border px-3 py-2 text-center">{team}</td>
              <td className="border px-3 py-2 text-center">{games}</td>
              <td className="border px-3 py-2 text-center">{wins}</td>
              <td className="border px-3 py-2 text-center">{draws}</td>
              <td className="border px-3 py-2 text-center">{losses}</td>
              <td className="border px-3 py-2 text-center font-semibold">{points}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={6} className="italic text-sm text-left px-4 py-2 bg-gray-50 border-t border-gray-200 text-gray-500">
              * Rankings determined by points, then wins, then head-to-head.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderMatchGrid = () => {
    const winColor = "bg-green-100";
    const drawColor = "bg-yellow-100";
    const lossColor = "bg-red-100";
    const ongoingColor = "bg-blue-100";

    return (
      <div>
        <div className="flex justify-between items-center mb-2 mt-5">
          <h2 className="text-lg font-medium text-sky-500 border-b border-gray-300 pb-2">Match Results Grid</h2>
          {isOwner && (
            <button
              onClick={() => {
                setResetModal(true);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reset All Matches
            </button>
          )}
        </div>
        <table className="table-auto w-full border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm text-gray-700 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="relative border px-3 py-6 text-center bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold pointer-events-none">
                  <svg className="absolute w-full h-full text-gray-300" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span className="absolute bottom-1 left-1/3 transform -translate-x-1/2 text-[15px] text-gray-500">Team</span>
                  <span className="absolute top-1 right-1 text-[15px] text-gray-500">Opponent</span>
                </div>
              </th>
              {teams.map((team, i) => (
                <th key={i} className="border px-3 py-1 text-center whitespace-nowrap">{team}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((rowTeam, i) => (
              <tr key={i}>
                <td className="font-semibold bg-gray-100 border px-3 py-2 text-center text-gray-700">{rowTeam}</td>
                {teams.map((colTeam, j) => {
                  const key = `${rowTeam}_vs_${colTeam}`;
                  const revKey = `${colTeam}_vs_${rowTeam}`;
                  const val = results[key] ?? results[revKey] ?? null;
                  let text = '', color = 'bg-white';
                  if (i === j) {
                    text = '—';
                    color = 'bg-gray-300';
                  } else if (val === null) {
                    text = '';
                  } else if (val === 'DRAW') {
                    text = 'D';
                    color = drawColor;
                  } else if (val === 'ONGOING') {
                    text = 'Ongoing Match';
                    color = ongoingColor;
                  } else if (val === rowTeam) {
                    text = 'W';
                    color = winColor;
                  } else if (val === null || val === "PENDING") {
                    text = '';
                    color = 'bg-white';                  
                  } else {
                    text = 'L';
                    color = lossColor;
                  }
                  return (
                    <td
                      key={j}
                      className={`cursor-pointer border px-3 py-1 text-center relative ${color} ${!isOwner ? 'cursor-not-allowed opacity-60' : ''}`}
                      onClick={() => {
                        if (!isOwner || i === j) return;
                        setModal({ teamA: rowTeam, teamB: colTeam, key, revKey });
                      }}
                    >
                      {text || (
                        <span className="text-black text-xs">
                          {rowTeam} vs {colTeam}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleResetMatches = async () => {
    if (!window.confirm('Are you sure you want to reset all match results? This action cannot be undone.')) {
      return;
    }

    try {
      setIsResetLoading(true);
      const response = await fetch('/api/match/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset matches');
      }

      // Refresh matches after reset
      await fetchMatches();
      toast.success('All matches have been reset');
    } catch (error) {
      console.error('Error resetting matches:', error);
      toast.error('Failed to reset matches');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className=" w-full mx-auto font-sans text-black space-y-8">
      {!tournamentHasStarted && isOwner && (
        <button
          onClick={generateTables}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          Generate Matches
        </button>
      )}

      {renderMatchGrid()}
      {renderLeaderboard()}

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Update Match Result</h3>
            <p className="mb-4">{modal.teamA} vs {modal.teamB}</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateResult(modal.teamA, modal.key, modal.revKey)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {modal.teamA} Wins
              </button>
              <button
                onClick={() => updateResult(modal.teamB, modal.key, modal.revKey)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                {modal.teamB} Wins
              </button>
              <button
                onClick={() => updateResult('DRAW', modal.key, modal.revKey)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Draw
              </button>
              <button
                onClick={() => updateResult('ONGOING', modal.key, modal.revKey)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ongoing
              </button>
              <button
                onClick={() => updateResult('PENDING', modal.key, modal.revKey)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Reset
              </button>
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {resetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reset All Matches</h3>
            <p className="mb-4">Are you sure you want to reset all match results?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleResetMatches}
                disabled={isResetLoading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                {isResetLoading ? 'Resetting...' : 'Reset All'}
              </button>
              <button
                onClick={() => setResetModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundRobin;