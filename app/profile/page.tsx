import getCurrentUser from "@/app/actions/getCurrentUser";
import ProfileForm from "@/app/Components/ProfileForm";
import Link from "next/link"; // ✅ Add this import

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-yellow-50 text-yellow-800 border border-yellow-300 rounded">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white text-gray-900 rounded-2xl shadow-lg p-8 space-y-6">
      {/* ✅ Add this button */}
      <div className="flex items-center justify-between bg-white border rounded-md px-4 py-3 shadow mb-6">
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          ← Back to Home
        </Link>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
