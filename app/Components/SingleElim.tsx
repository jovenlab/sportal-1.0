import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
    teams: string[];
    listingId: string;
}

type Game = {
  round: number;
  game: number;
  id: number;
  teams: (string | null)[];
  nextGameId: number | null;
  locked: boolean;
  matchId?: string;
};

type MatchResult = string | 'DRAW' | null | 'ONGOING' | 'PENDING';

const knownBrackets = [2, 4, 8, 16, 32];

export default function SingleElim({ teams, listingId }: Props) {
  const router = useRouter();
  const [brackets, setBrackets] = useState<Game[]>([]);
  const [winner, setWinner] = useState("");
  const [bracketCount, setBracketCount] = useState(0);
  const [winners, setWinners] = useState<{ [gameId: number]: string }>({});
  const [isSelectingTopSeeds, setIsSelectingTopSeeds] = useState(false);
  const [topSeedChoices, setTopSeedChoices] = useState<string[]>([]);
  const [byesNeeded, setByesNeeded] = useState(0);
  const [isStartingTournament, setIsStartingTournament] = useState(false);
  const [tournamentStarted, setTournamentStarted] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [modal, setModal] = useState<{ teamA: string, teamB: string, gameId: number } | null>(null);
  
  useEffect(() => {
    if (teams && teams.length >= 2) {
      generateBracket(teams);
    } else if (teams && teams.length < 2) {
      setBrackets([]);
      setWinner("");
      setBracketCount(0);
      setWinners({});
    }
  }, [teams]);

  // Separate useEffect for loading matches
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch(`/api/match?listingId=${listingId}`);
        const data = await response.json();
        setMatches(data);
        setTournamentStarted(data.length > 0);

        // Only update brackets if we have matches and brackets
        if (data.length > 0 && brackets.length > 0) {
          const updatedBrackets = brackets.map(game => {
            // Find matching match for this game
            const match = data.find((m: any) => 
              (m.teamA === game.teams[0] && m.teamB === game.teams[1]) ||
              (m.teamA === game.teams[1] && m.teamB === game.teams[0]) ||
              (game.teams[0] === "TBD" && m.teamA === "TBD") ||
              (game.teams[1] === "TBD" && m.teamB === "TBD")
            );
            
            if (match) {
              console.log("Found match for game:", {
                gameId: game.id,
                matchId: match.id,
                teams: game.teams,
                result: match.result
              });

              // If there's a winner, update the winners state
              if (match.result && match.result !== 'PENDING' && match.result !== 'ONGOING' && match.result !== 'DRAW') {
                setWinners(prev => ({
                  ...prev,
                  [game.id]: match.result
                }));

                // Update the next game's teams if this game is complete
                if (game.nextGameId) {
                  const nextGame = brackets.find(g => g.id === game.nextGameId);
                  if (nextGame) {
                    const isFirstFeeder = game.id % 2 === 1; // Odd IDs are first feeders
                    const nextTeamIndex = isFirstFeeder ? 0 : 1;
                    nextGame.teams[nextTeamIndex] = match.result;
                  }
                }
              }

              return {
                ...game,
                matchId: match.id,
                locked: match.result && match.result !== 'PENDING' && match.result !== 'ONGOING',
                teams: game.teams // Preserve the current teams state
              };
            }
            return game;
          });
          
          console.log("Updated brackets with match IDs and winners:", updatedBrackets);
          setBrackets(updatedBrackets);
        }
      } catch (error) {
        console.error("Error loading matches:", error);
      }
    };

    loadMatches();
  }, [listingId, brackets.length > 0]); // Only run when brackets are generated

  const getClosestBracketSize = (base: number) => {
    return knownBrackets.find((k) => k >= base) || base;
  };

  const canPlayGame = (struct: Game[], game: Game): boolean => {
    if (game.round === 1) return true;
    const prevRound = game.round - 1;
    const feederGames = struct.filter(
      (g) => g.round === prevRound && g.nextGameId === game.id
    );
    return feederGames.every((prev) => prev.locked === true);
  };

  const advanceTeam = (
    struct: Game[],
    currentGame: Game,
    winnerName: string
  ) => {
    setWinners((prev) => ({ ...prev, [currentGame.id]: winnerName }));

    if (!currentGame.nextGameId) {
      setWinner(winnerName);
      return;
    }

    const nextGame = struct.find((g) => g.id === currentGame.nextGameId);
    if (!nextGame) return;

    const feederGames = struct.filter(
      (g) =>
        g.round === currentGame.round && g.nextGameId === currentGame.nextGameId
    );

    const isFirstFeeder = feederGames[0]?.id === currentGame.id;
    const nextTeamIndex = isFirstFeeder ? 0 : 1;

    if (nextGame.teams[nextTeamIndex] === winnerName) return;
    if (nextGame.teams[nextTeamIndex] && nextGame.teams[nextTeamIndex] !== winnerName) return;

    nextGame.teams[nextTeamIndex] = winnerName;
    setBrackets([...struct]);
  };

  const handleTeamClick = (gameId: number, teamName: string) => {
    const game = brackets.find(g => g.id === gameId);
    if (!game || game.locked) return;

    if (!canPlayGame(brackets, game)) {
      alert("You must complete the previous games first.");
      return;
    }

    const updated = brackets.map((game) => {
      if (game.id !== gameId) return { ...game };
    
      const newTeams = game.teams.map((t) =>
        t === teamName ? t : t === "BYE" ? "BYE" : getLosingTeam(game.teams, teamName)
      );
    
      const updatedGame: Game = {
        ...game,
        teams: newTeams,
        locked: true,
      };
    
      advanceTeam(brackets, updatedGame, teamName);
      return updatedGame;
    });
    
    setBrackets([...updated]);
    setWinners((prev) => ({ ...prev, [gameId]: teamName }));
  };

  const getLosingTeam = (teams: (string | null)[], winner: string) => {
    return teams.find((t) => t !== winner && t !== "BYE") || "";
  };

  const assignByesToTopSeeds = (
    teamList: string[],
    topSeeds: string[],
    totalSlots: number
  ): string[] => {
    const listWithByes: string[] = [];

    for (let team of teamList) {
      listWithByes.push(team);
      if (topSeeds.includes(team)) {
        listWithByes.push("BYE");
      }
    }

    while (listWithByes.length < totalSlots) {
      listWithByes.push("BYE");
    }

    return listWithByes.slice(0, totalSlots);
  };

  const finalizeBracket = (finalTeams: string[]) => {
    const rounds = Math.ceil(Math.log2(finalTeams.length));
    const struct: Game[] = [];
    let gameId = 1;

    // Create all games for each round
    for (let round = 1; round <= rounds; round++) {
      const gamesInRound = Math.pow(2, rounds - round);
      for (let game = 0; game < gamesInRound; game++) {
        struct.push({
          round,
          game,
          id: gameId++,
          teams: [null, null],
          nextGameId: null,
          locked: false,
        });
      }
    }

    // Set up nextGameId connections
    for (let round = 1; round < rounds; round++) {
      const currentRoundGames = struct.filter(g => g.round === round);
      const nextRoundGames = struct.filter(g => g.round === round + 1);
      
      for (let i = 0; i < currentRoundGames.length; i += 2) {
        const game1 = currentRoundGames[i];
        const game2 = currentRoundGames[i + 1];
        const nextGame = nextRoundGames[Math.floor(i / 2)];
        
        if (game1 && nextGame) game1.nextGameId = nextGame.id;
        if (game2 && nextGame) game2.nextGameId = nextGame.id;
      }
    }

    // Assign teams to first round games
    const firstRoundGames = struct.filter(g => g.round === 1);
    for (let i = 0; i < firstRoundGames.length; i++) {
      const game = firstRoundGames[i];
      game.teams = [
        finalTeams[i * 2] || "BYE",
        finalTeams[i * 2 + 1] || "BYE"
      ];
    }

    setBrackets(struct);
    setBracketCount((b) => b + 1);
    setWinner("");

    // Handle byes in first round
    for (let game of firstRoundGames) {
      const realTeams = game.teams.filter((t) => t !== "BYE");
      if (realTeams.length === 1) {
        game.locked = true;
        advanceTeam(struct, game, realTeams[0]!);
      }
    }

    setBrackets([...struct]);
  };

  const generateBracket = (teamList: string[]) => {
    if (teamList.length < 2 || teamList.length > 32) {
      alert("Please enter between 2 and 32 team names.");
      return;
    }

    const lowerCaseNames = teamList.map((t) => t.toLowerCase());
    const duplicates = lowerCaseNames.filter(
      (name, idx) => lowerCaseNames.indexOf(name) !== idx
    );

    if (duplicates.length > 0) {
      const confirmed = window.confirm(
        "Some team names seem to be duplicates (e.g. " +
          [...new Set(duplicates)].join(", ") +
          "). Continue anyway?"
      );
      if (!confirmed) return;
    }

    const bracketSize = getClosestBracketSize(teamList.length);
    const byes = bracketSize - teamList.length;
    setByesNeeded(byes);

    if (byes > 0) {
      const topSeeds = teamList.slice(0, byes);
      setTopSeedChoices(topSeeds);
      setIsSelectingTopSeeds(true);
    } else {
      finalizeBracket(teamList);
    }
  };

  const handleTopSeedSelection = (selectedSeeds: string[]) => {
    const remainingTeams = teams.filter((t) => !selectedSeeds.includes(t));
    const finalTeams = assignByesToTopSeeds(
      remainingTeams,
      selectedSeeds,
      getClosestBracketSize(teams.length)
    );
    finalizeBracket(finalTeams);
    setIsSelectingTopSeeds(false);
  };

  const resetBracket = async () => {
    try {
      // Delete matches from database
      const deleteResponse = await fetch("/api/match/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId }),
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete matches");
      }

      // Reset local state
      setBrackets([]);
      setWinner("");
      setBracketCount(0);
      setWinners({});
      setIsSelectingTopSeeds(false);
      setTopSeedChoices([]);
      setByesNeeded(0);
      setTournamentStarted(false);
      setMatches([]);

      toast.success("Tournament reset successfully");
    } catch (error) {
      console.error("Error resetting tournament:", error);
      toast.error("Failed to reset tournament");
    }
  };

  const saveBracket = async () => {
    try {
      const response = await fetch("/api/brackets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Single Elimination Tournament",
          type: "single-elimination",
          teams: teams,
          games: brackets.map((game) => ({
            round: game.round,
            game: game.game,
            teams: game.teams,
            winner: winners[game.id] || null,
            locked: game.locked,
          })),
          winner: winner,
          listingId: listingId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save bracket");
      }

      alert("Bracket saved successfully!");
    } catch (error) {
      console.error("Error saving bracket:", error);
      alert("Failed to save bracket. Please try again.");
    }
  };

  const startTournament = async () => {
    setIsStartingTournament(true);

    try {
      // First, check if matches already exist and delete them if they do
      const existingMatches = await fetch(`/api/match?listingId=${listingId}`);
      const matches = await existingMatches.json();
      
      if (matches.length > 0) {
        const confirmDelete = window.confirm(
          "Matches already exist for this tournament. Do you want to delete them and generate new ones?"
        );
        if (!confirmDelete) {
          setIsStartingTournament(false);
          return;
        }

        const deleteResponse = await fetch("/api/match/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listingId }),
        });

        if (!deleteResponse.ok) {
          throw new Error("Failed to delete existing matches");
        }
      }

      // Update tournament date to current time
      const updateDateResponse = await fetch(`/api/listings/${listingId}/date`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tournamentDate: new Date().toISOString(),
        }),
      });

      if (!updateDateResponse.ok) {
        throw new Error("Failed to update tournament date");
      }

      // Create matches for each game in the first round
      const firstRoundGames = brackets.filter(game => game.round === 1);
      const finalGame = brackets.find(game => game.round === 2);
      const updatedBrackets = [...brackets];
      
      // Create first round matches
      for (const game of firstRoundGames) {
        if (game.teams[0] === "BYE" || game.teams[1] === "BYE") {
          // Handle bye automatically
          const realTeam = game.teams.find(team => team !== "BYE");
          if (realTeam) {
            handleTeamClick(game.id, realTeam);
          }
          continue;
        }

        console.log("Creating match for game:", {
          gameId: game.id,
          teamA: game.teams[0],
          teamB: game.teams[1],
          round: game.round
        });

        const response = await fetch("/api/match/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            listingId,
            tournamentType: 'SINGLE_ELIMINATION',
            teamA: game.teams[0],
            teamB: game.teams[1],
            round: game.round
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create match");
        }

        const matchData = await response.json();
        console.log("Match created:", matchData);
        
        // Update the game with the match ID
        const gameIndex = updatedBrackets.findIndex(g => g.id === game.id);
        if (gameIndex !== -1) {
          updatedBrackets[gameIndex] = {
            ...updatedBrackets[gameIndex],
            matchId: matchData.id
          };
        }
      }

      // Create final match
      if (finalGame) {
        console.log("Creating final match:", {
          gameId: finalGame.id,
          teamA: finalGame.teams[0],
          teamB: finalGame.teams[1],
          round: finalGame.round
        });

        const finalResponse = await fetch("/api/match/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            listingId,
            tournamentType: 'SINGLE_ELIMINATION',
            teamA: finalGame.teams[0] || "TBD",
            teamB: finalGame.teams[1] || "TBD",
            round: finalGame.round
          }),
        });

        if (!finalResponse.ok) {
          throw new Error("Failed to create final match");
        }

        const finalMatchData = await finalResponse.json();
        console.log("Final match created:", finalMatchData);
        
        // Update the final game with the match ID
        const finalGameIndex = updatedBrackets.findIndex(g => g.id === finalGame.id);
        if (finalGameIndex !== -1) {
          updatedBrackets[finalGameIndex] = {
            ...updatedBrackets[finalGameIndex],
            matchId: finalMatchData.id
          };
        }
      }

      // Update the brackets state with the new match IDs
      setBrackets(updatedBrackets);

      // Refresh matches
      const matchesResponse = await fetch(`/api/match?listingId=${listingId}`);
      const updatedMatches = await matchesResponse.json();
      setMatches(updatedMatches);
      setTournamentStarted(true);

      toast.success("Tournament started successfully!");
    } catch (error) {
      console.error("Error starting tournament:", error);
      toast.error("Failed to start tournament. Please try again.");
    } finally {
      setIsStartingTournament(false);
    }
  };

  const updateMatchResult = async (gameId: number, result: MatchResult) => {
    const game = brackets.find(g => g.id === gameId);
    if (!game || !game.matchId) {
      console.log("No game or matchId found:", { gameId, game });
      return;
    }

    try {
      console.log("Updating match result:", {
        gameId,
        result,
        teams: game.teams,
        matchId: game.matchId,
        round: game.round
      });

      // Update the match in the database
      const response = await fetch("/api/match/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamA: game.teams[0],
          teamB: game.teams[1],
          result: result,
          listingId: listingId,
          matchId: game.matchId
        }),        
      });

      if (!response.ok) {
        throw new Error("Failed to update match result");
      }

      // Update local state and propagate changes
      setWinners(prev => {
        const newWinners = { ...prev };
        if (result !== 'PENDING' && result !== 'ONGOING' && result !== 'DRAW' && (result === game.teams[0] || result === game.teams[1])) {
           newWinners[gameId] = result as string;
        } else {
           delete newWinners[gameId];
        }
        return newWinners;
      });

      setBrackets(prevBrackets => {
        let updatedBrackets = prevBrackets.map(g => {
          if (g.id === gameId) {
            return {
              ...g,
              locked: result !== 'PENDING' && result !== 'ONGOING'
            };
          }
          return g;
        });

        // Function to propagate changes recursively
        const propagateChanges = async (currentBrackets: Game[], currentGameId: number, currentResult: MatchResult): Promise<Game[]> => {
            const currentGame = currentBrackets.find(g => g.id === currentGameId);
            if (!currentGame || !currentGame.nextGameId) return currentBrackets;

            const nextGame = currentBrackets.find(g => g.id === currentGame.nextGameId);
            if (!nextGame) return currentBrackets;

            const feederGames = currentBrackets.filter(g => 
                g.round === currentGame.round && 
                g.nextGameId === nextGame.id
            );

            const isFirstFeeder = feederGames[0]?.id === currentGame.id;
            const nextTeamIndex = isFirstFeeder ? 0 : 1;
            
            let changesMade = false;
            const newNextTeams = [...nextGame.teams];

            if (currentResult !== 'PENDING' && currentResult !== 'ONGOING' && currentResult !== 'DRAW' && (currentResult === currentGame.teams[0] || currentResult === currentGame.teams[1])) {
                const winnerTeam = currentResult as string;
                // Only update if the team slot in the next game is different or TBD
                 if (newNextTeams[nextTeamIndex] !== winnerTeam) {
                     newNextTeams[nextTeamIndex] = winnerTeam;
                     changesMade = true;
                 }
            } else { // If the result is PENDING, ONGOING, or DRAW, remove the team from the next round
               const previousWinner = winners[currentGameId]; // Use the state value before this update
               if(previousWinner && newNextTeams[nextTeamIndex] === previousWinner) {
                    newNextTeams[nextTeamIndex] = null;
                    changesMade = true;
               }
            }

            if(changesMade) {
                const bracketsAfterPropagation = currentBrackets.map(g => {
                    if(g.id === nextGame.id) {
                        return {
                            ...g,
                            teams: newNextTeams,
                            locked: newNextTeams[0] !== null && newNextTeams[1] !== null ? g.locked : false
                        };
                    }
                    return g;
                });

                // If both teams are determined for the next game, update the match in the database
                if (newNextTeams[0] !== null && newNextTeams[1] !== null && nextGame.matchId) {
                    try {
                        console.log("Updating next match in database:", {
                            matchId: nextGame.matchId,
                            currentTeams: [nextGame.teams[0], nextGame.teams[1]],
                            newTeams: newNextTeams
                        });

                        const updateResponse = await fetch("/api/match/update", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                teamA: newNextTeams[0],
                                teamB: newNextTeams[1],
                                result: "PENDING",
                                listingId: listingId,
                                matchId: nextGame.matchId,
                                round: nextGame.round
                            }),
                        });

                        if (!updateResponse.ok) {
                            throw new Error("Failed to update next match");
                        }

                        const updatedMatch = await updateResponse.json();
                        console.log("Successfully updated next match:", updatedMatch);

                        // Update the match ID in the brackets if needed
                        if (updatedMatch.id !== nextGame.matchId) {
                            return bracketsAfterPropagation.map(g => {
                                if (g.id === nextGame.id) {
                                    return {
                                        ...g,
                                        matchId: updatedMatch.id
                                    };
                                }
                                return g;
                            });
                        }
                    } catch (error) {
                        console.error("Error updating next match:", error);
                        toast.error("Failed to update next match");
                    }
                }

                return bracketsAfterPropagation;
            }

            return currentBrackets;
        };

        // Start propagation from the current game
        propagateChanges(updatedBrackets, gameId, result).then(finalBrackets => {
            setBrackets(finalBrackets);
        });

        // If this is the final round, update the tournament winner
        if (!game.nextGameId) {
            if (result !== 'PENDING' && result !== 'ONGOING' && result !== 'DRAW' && (result === game.teams[0] || result === game.teams[1])) {
                 setWinner(result as string);
            } else {
                 setWinner("");
            }
        }

        return updatedBrackets;
      });

      // Refresh matches (this will pick up DB changes for subsequent matches if needed)
      const matchesResponse = await fetch(`/api/match?listingId=${listingId}`);
      const updatedMatches = await matchesResponse.json();
      setMatches(updatedMatches);

      toast.success("Match result updated successfully");
    } catch (error) {
      console.error("Error updating match result:", error);
      toast.error("Failed to update match result");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Single Elimination Tournament</h2>
          {tournamentStarted && (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              Tournament in Progress
            </span>
          )}
        </div>
        
        {!tournamentStarted ? (
          <button
            onClick={startTournament}
            disabled={isStartingTournament}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isStartingTournament ? "Starting..." : "Start Tournament"}
          </button>
        ) : (
          <button
            onClick={resetBracket}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reset Tournament
          </button>
        )}
      </div>

      {isSelectingTopSeeds && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Select {byesNeeded} top seed{byesNeeded > 1 ? "s" : ""} to receive byes:
          </h3>
          <div className="flex flex-wrap gap-2">
            {topSeedChoices.map((seed) => (
              <button
                key={seed}
                onClick={() => handleTopSeedSelection([seed])}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {seed}
              </button>
            ))}
          </div>
        </div>
      )}

      {brackets.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Tournament Bracket</h3>
            {tournamentStarted && (
              <div className="text-sm text-gray-600">
                {matches.length} matches created • {matches.filter(m => m.result !== "PENDING").length} completed
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(new Set(brackets.map((b) => b.round))).map((round) => (
              <div key={round} className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-700">Round {round}</h4>
                {brackets
                  .filter((b) => b.round === round)
                  .map((game) => {
                    const match = matches.find(m => m.id === game.matchId);
                    return (
                      <div
                        key={game.id}
                        className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2">
                          {game.teams.map((team, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                console.log("Match clicked:", {
                                  gameId: game.id,
                                  matchId: game.matchId,
                                  teams: game.teams,
                                  match
                                });
                                // Only show modal if both teams are present and not BYE
                                if (game.matchId && 
                                    game.teams[0] !== "BYE" && 
                                    game.teams[1] !== "BYE" && 
                                    game.teams[0] !== null && 
                                    game.teams[1] !== null) {
                                  setModal({
                                    teamA: game.teams[0] || '',
                                    teamB: game.teams[1] || '',
                                    gameId: game.id
                                  });
                                }
                              }}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                winners[game.id] === team
                                  ? "bg-green-100 border border-green-500"
                                  : game.locked
                                  ? "bg-gray-100"
                                  : game.matchId && 
                                    game.teams[0] !== "BYE" && 
                                    game.teams[1] !== "BYE" &&
                                    game.teams[0] !== null &&
                                    game.teams[1] !== null
                                  ? "bg-blue-50 hover:bg-blue-100"
                                  : "bg-gray-50"
                              }`}
                            >
                              {team || "TBD"}
                              {match && match.result === team && " ✓"}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>

          {winner && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-green-800">Tournament Winner:</h3>
              <p className="text-2xl font-semibold text-green-600">{winner}</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Update Match Result</h3>
            <p className="mb-4">{modal.teamA} vs {modal.teamB}</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  updateMatchResult(modal.gameId, modal.teamA);
                  setModal(null);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                {modal.teamA} Wins
              </button>
              <button
                onClick={() => {
                  updateMatchResult(modal.gameId, modal.teamB);
                  setModal(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                {modal.teamB} Wins
              </button>
              <button
                onClick={() => {
                  updateMatchResult(modal.gameId, 'DRAW');
                  setModal(null);
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Draw
              </button>
              <button
                onClick={() => {
                  updateMatchResult(modal.gameId, 'ONGOING');
                  setModal(null);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Ongoing
              </button>
              <button
                onClick={() => {
                  updateMatchResult(modal.gameId, 'PENDING');
                  setModal(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 