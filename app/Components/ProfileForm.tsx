'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function ProfileForm({ user }: { user: any }) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [age, setAge] = useState(user.age || '');
  const [location, setLocation] = useState(user.location || '');
  const [image, setImage] = useState(user.image || '/default-avatar.png');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64 = reader.result;

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    });

    const data = await res.json();
    if (data.url) {
      setImage(data.url); // Save the returned Cloudinary URL in state
    }
  };

  reader.readAsDataURL(file);
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const uploadedImage = image;

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio, age, location, image: uploadedImage }),
    });

    if (res.ok) {
      toast.success('Profile updated!');
      setEditing(false);
    } else {
      toast.error('Error updating profile.');
    }
  } catch (err) {
    toast.error('Something went wrong.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto bg-white text-gray-900 rounded-lg shadow p-6 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>

      {/* Avatar and top info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {!image || image.includes('your-storage.com') ? (
              <Image
                src="/default-avatar.png"
                alt="Default Avatar"
                width={64}
                height={64}
                className="rounded-full border object-cover"
              />
            ) : (
              <Image
                src={image}
                alt="User Avatar"
                width={64}
                height={64}
                className="rounded-full border object-cover"
              />
            )}
          <div>
            <h2 className="text-lg font-semibold">{user.name || 'Your Name'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing((prev) => !prev)}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {editing && (
          <div>
            <label className="block text-sm font-medium mb-1">Change Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              className="block w-full text-sm text-gray-600"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            disabled={!editing || loading}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            disabled={!editing || loading}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              value={age}
              disabled={!editing || loading}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={location}
              disabled={!editing || loading}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {editing && (
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full py-2 px-4 text-white rounded-md transition ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </form>
    </div>
  );
}
