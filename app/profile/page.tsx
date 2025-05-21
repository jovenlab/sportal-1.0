import { getCurrentUser } from '@/libs/auth';
import ProfileForm from '@/Components/ProfileForm';


export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div className="p-6">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <ProfileForm user={user} />
    </div>
  );
}
