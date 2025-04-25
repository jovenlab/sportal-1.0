// app/profile/page.tsx

import React from "react";
import getCurrentUser from "@/app/actions/getCurrentUser";
import ProfileClient from "./ProfileClient"; // ✅ make sure this file exists

const ProfilePage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-600">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <ProfileClient
      user={{
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        image: currentUser.image,
        createdAt: currentUser.createdAt,
      }}
    />
  );
};

export default ProfilePage;
