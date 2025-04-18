"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Container from "@/app/components/Container";
import Heading from "@/app/components/Heading";
import useTournamentPage from "@/app/hooks/useTournamentPage";
import TournamentHeader from "./components/TournamentHeader";
import TournamentInfo from "./components/TournamentInfo";
import MatchesList from "./components/MatchesList";
import TournamentBracket from "./components/TournamentBracket";
import EmptyState from "@/app/components/EmptyState";
import Loader from "@/app/components/Loader";

const TournamentPage = () => {
  const params = useParams();
  const tournamentId = params.tournamentId as string;

  const { tournament, matches, isLoading, error, fetchTournament } =
    useTournamentPage();

  useEffect(() => {
    if (tournamentId) {
      fetchTournament(tournamentId);
    }
  }, [tournamentId, fetchTournament]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !tournament) {
    return (
      <EmptyState
        title="Tournament Not Found"
        subtitle="The tournament you're looking for doesn't exist or has been removed."
      />
    );
  }

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-6">
          <TournamentHeader
            title={tournament.title}
            imageSrc={tournament.imageSrc}
            id={tournament.id}
            category={tournament.category}
          />

          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            <TournamentInfo
              tournament={tournament}
              className="col-span-4 order-2 md:order-1"
            />

            <div className="col-span-3 order-1 md:order-2">
              <div className="rounded-xl border-[1px] border-neutral-200 overflow-hidden">
                <div className="flex flex-col gap-1 p-4">
                  <div className="text-xl font-semibold">
                    Tournament Details
                  </div>
                  <div className="font-light text-neutral-500">
                    {tournament.description}
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <div className="font-semibold">Date:</div>
                    <div className="font-light">
                      {tournament.tournamentDate}
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <div className="font-semibold">Entry Fee:</div>
                    <div className="font-light">${tournament.price}</div>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <div className="font-semibold">Teams:</div>
                    <div className="font-light">{tournament.guestCount}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr />

          <Heading
            title="Tournament Matches"
            subtitle="View all matches and results"
          />

          {matches.length > 0 ? (
            <>
              <MatchesList matches={matches} />
              <hr />
              <Heading
                title="Tournament Bracket"
                subtitle="View the tournament progression"
              />
              <TournamentBracket matches={matches} />
            </>
          ) : (
            <EmptyState
              title="No Matches Yet"
              subtitle="Matches will be displayed once the tournament begins."
              small
            />
          )}
        </div>
      </div>
    </Container>
  );
};

export default TournamentPage;
