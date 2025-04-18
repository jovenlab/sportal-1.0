import {Listing,Reservation,User} from "@prisma/client";

export type SafeListing = Omit<
    Listing,
    "createdAt"
> & {
    createdAt: string;
}

export type SafeReservations = Omit<
    Reservation,
    "createdAt" | "startDate" | "endDate" | "listing"
> & {
    createdAt: string;
    startDate: string;
    endDate: string;
    listing: SafeListing;
}


export type SafeUser = Omit<
    User,
    "createdAt" | "updatedAt" | "emailVerified"
> & {
    createdAt: string;
    updatedAt: string;
    emailVerified: string | null;
};

//jeric modsidifications
export interface Participant {
    id: number;
    name: string;
  }
  
  export interface Match {
    id: number;
    team1: string;
    team2: string;
    date: string;
    winner?: string; // Optional field for matches that haven't been played yet
  }
  
  export interface Tournament {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    participants: Participant[];
    matches: Match[];
  }