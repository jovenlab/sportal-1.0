'use client';

import React from "react";
import Avatar from "@/app/Components/Avatar";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileClientProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
}

const ProfileClient: React.FC<ProfileClientProps> = ({ user }) => {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md space-y-6">
      <div className="flex items-center space-x-6">
        <Avatar src={user.image} size={80} />
        <div>
          <h1 className="text-2xl font-semibold">{user.name || "No Name"}</h1>
          <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
        </div>
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
        <div>
          <strong>User ID:</strong> {user.id}
        </div>
        <div>
          <strong>Joined:</strong>{" "}
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
        >
          Back to Home
        </Link>
        <button
          onClick={() => alert("Edit profile coming soon!")}
          className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
        >
          Edit Profile
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <p className="text-gray-500 dark:text-gray-400 italic">
          No recent activity available yet.
        </p>
      </div>
    </div>
  );
};

export default ProfileClient;
