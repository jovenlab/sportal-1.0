// app/mockData.ts
import { Tournament } from './../types/';

export const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: 'Basketball Championship',
    description: 'Annual basketball tournament for all ages.',
    startDate: '2023-11-01',
    endDate: '2023-11-05',
    participants: [
      { id: 1, name: 'Team A' },
      { id: 2, name: 'Team B' },
      { id: 3, name: 'Team C' },
    ],
    matches: [
      { id: 1, team1: 'Team A', team2: 'Team B', date: '2023-11-01', winner: 'Team A' },
      { id: 2, team1: 'Team C', team2: 'Team A', date: '2023-11-02', winner: 'Team C' },
    ],
    registrationFields: [
      { id: 1, label: 'Full Name', type: 'string', required: true },
      { id: 2, label: 'Age', type: 'integer', required: true },
      { id: 3, label: 'Email', type: 'string', required: true },
      { id: 4, label: 'Phone Number', type: 'string', required: false },
    ],
  },
  {
    id: 2,
    name: 'Soccer League',
    description: 'Local soccer league for schools.',
    startDate: '2023-10-15',
    endDate: '2023-10-20',
    participants: [
      { id: 4, name: 'School X' },
      { id: 5, name: 'School Y' },
    ],
    matches: [
      { id: 3, team1: 'School X', team2: 'School Y', date: '2023-10-16', winner: 'School X' },
    ],
    registrationFields: [
      { id: 1, label: 'Full Name', type: 'string', required: true },
      { id: 2, label: 'Gender', type: 'string', required: true },
      { id: 3, label: 'Date of Birth', type: 'date', required: true },
      { id: 4, label: 'Team Name', type: 'string', required: true },
    ],
  },
  {
    id: 3,
    name: 'Chess Championship',
    description: 'Annual chess tournament for individual players.',
    startDate: '2023-11-01',
    endDate: '2023-11-05',
    participants: [
      { id: 1, name: 'Alice Johnson' },
      { id: 2, name: 'Bob Smith' },
      { id: 3, name: 'Charlie Brown' },
      { id: 4, name: 'Diana Prince' },
    ],
    matches: [
      { id: 1, team1: 'Alice Johnson', team2: 'Bob Smith', date: '2023-11-01', winner: 'Alice Johnson' },
      { id: 2, team1: 'Charlie Brown', team2: 'Diana Prince', date: '2023-11-02', winner: 'Diana Prince' },
      { id: 3, team1: 'Alice Johnson', team2: 'Diana Prince', date: '2023-11-03', winner: undefined }, // Match not yet played
    ],
    registrationFields: [
      { id: 1, label: 'Full Name', type: 'string', required: true },
      { id: 2, label: 'Gender', type: 'string', required: true },
      { id: 3, label: 'Date of Birth', type: 'date', required: true },
      { id: 4, label: 'Team Name', type: 'string', required: true },
    ],
  },
  {
    id: 4,
    name: 'Tennis Open',
    description: 'Local tennis tournament for singles players.',
    startDate: '2023-10-15',
    endDate: '2023-10-20',
    participants: [
      { id: 5, name: 'Ethan Hunt' },
      { id: 6, name: 'Fiona Gallagher' },
      { id: 7, name: 'Gus Fring' },
      { id: 8, name: 'Hannah Baker' },
    ],
    matches: [
      { id: 4, team1: 'Ethan Hunt', team2: 'Fiona Gallagher', date: '2023-10-16', winner: 'Ethan Hunt' },
      { id: 5, team1: 'Gus Fring', team2: 'Hannah Baker', date: '2023-10-17', winner: 'Hannah Baker' },
      { id: 6, team1: 'Ethan Hunt', team2: 'Hannah Baker', date: '2023-10-19', winner: undefined }, // Match not yet played
    ],
    registrationFields: [
      { id: 1, label: 'Full Name', type: 'string', required: true },
      { id: 2, label: 'Age', type: 'integer', required: true },
      { id: 3, label: 'Email', type: 'string', required: true },
      { id: 4, label: 'Phone Number', type: 'string', required: false },
    ],
  },
];