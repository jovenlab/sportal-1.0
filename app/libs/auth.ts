import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions"; // 👈 now clean
import { db } from "./db";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}
