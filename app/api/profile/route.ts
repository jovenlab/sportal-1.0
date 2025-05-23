import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { db } from "@/app/libs/db";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    name, bio, age, location, image, sport,
    team, level, achievements, instagram, facebook, strava
  } = body;

  console.log("📥 Received profile update body:", body);
  console.log("🔍 Incoming image URL:", image);

  const user = await getCurrentUser();
  console.log("🔐 Current user:", user);

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const parsedAge = age ? parseInt(age) : null;

    console.log("🛠️ Updating user with ID:", user.id);
    console.log("📝 New user data:", {
      name,
      bio,
      age: parsedAge,
      location,
      image,
      sport,
      team,
      level,
      achievements,
      instagram,
      facebook,
      strava
    });

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name,
        bio,
        age: parsedAge,
        location,
        image,
        sport,
        team,
        level,
        achievements,
        instagram,
        facebook,
        strava
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("❌ Update profile error:", error.message, error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
