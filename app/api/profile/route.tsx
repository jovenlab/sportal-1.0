import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/libs/auth';
import { db } from '@/libs/db';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

 const { name, bio, age, location, image } = await req.json();

const parsedAge = age ? parseInt(age) : null;

await db.user.update({
  where: { id: user.id },
  data: {
    name,
    bio,
    age: parsedAge,
    location,
    image,
  },
});

  return NextResponse.json({ success: true });
}
