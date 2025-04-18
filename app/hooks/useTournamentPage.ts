import { useCallback, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Tournament {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    value: string;
    label: string;
    flag: string;
    latlng: [number, number];
    region: string;
  };
  guestCount: number; // Number of teams
  imageSrc: string;
  price: number;
  tournamentDate: string;
  createdAt: string;
  userId: string;
}

interface Match {
  id: string;
  tournamentId: string;
  team1: string;
  team2: string;
  score1: number | null;
  score2: number | null;
  round: number;
  matchNumber: number;
  startTime: string;
  status: "scheduled" | "in_progress" | "completed";
}

interface UseTournamentPage {
  tournament: Tournament | null;
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  fetchTournament: (id: string) => Promise<void>;
  registerTeam: (teamName: string) => Promise<void>;
  updateMatchScore: (
    matchId: string,
    score1: number,
    score2: number
  ) => Promise<void>;
}

export default function useTournamentPage(): UseTournamentPage {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTournament = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch tournament details
      const { data: tournamentData } = await axios.get(
        `/api/tournaments/${id}`
      );
      setTournament(tournamentData);

      // Fetch tournament matches
      const { data: matchesData } = await axios.get(
        `/api/tournaments/${id}/matches`
      );
      setMatches(matchesData);
    } catch (err) {
      setError("Failed to load tournament data");
      toast.error("Something went wrong while loading the tournament");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerTeam = useCallback(
    async (teamName: string) => {
      if (!tournament) return;

      setIsLoading(true);
      try {
        await axios.post(`/api/tournaments/${tournament.id}/teams`, {
          teamName,
        });
        toast.success("Team registered successfully!");
        // Refresh tournament data
        fetchTournament(tournament.id);
      } catch (err) {
        toast.error("Failed to register team");
      } finally {
        setIsLoading(false);
      }
    },
    [tournament, fetchTournament]
  );

  const updateMatchScore = useCallback(
    async (matchId: string, score1: number, score2: number) => {
      if (!tournament) return;

      setIsLoading(true);
      try {
        await axios.patch(`/api/matches/${matchId}`, {
          score1,
          score2,
          status: "completed",
        });
        toast.success("Match score updated!");

        // Update local match data
        setMatches((prev) =>
          prev.map((match) =>
            match.id === matchId
              ? { ...match, score1, score2, status: "completed" as const }
              : match
          )
        );
      } catch (err) {
        toast.error("Failed to update match score");
      } finally {
        setIsLoading(false);
      }
    },
    [tournament]
  );

  return {
    tournament,
    matches,
    isLoading,
    error,
    fetchTournament,
    registerTeam,
    updateMatchScore,
  };
}
