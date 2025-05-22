'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FaInstagram, FaFacebook, FaStrava, FaEdit, FaTimes } from 'react-icons/fa';
import { useEffect } from 'react';


export default function ProfileForm({ user }: { user: any }) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [age, setAge] = useState(user.age || '');
  const [location, setLocation] = useState(user.location || '');
  const [image, setImage] = useState(user.image || '/default-avatar.png');
  const [sport, setSport] = useState(user.sport || '');
  const [team, setTeam] = useState(user.team || '');
  const [level, setLevel] = useState(user.level || '');
  const [achievements, setAchievements] = useState(user.achievements || '');
  const [instagram, setInstagram] = useState(user.instagram || '');
  const [facebook, setFacebook] = useState(user.facebook || '');
  const [strava, setStrava] = useState(user.strava || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImageSelected, setNewImageSelected] = useState(false);

  useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false);
    }
  };

  window.addEventListener('keydown', handleEsc);
  return () => window.removeEventListener('keydown', handleEsc);
}, []);


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
      setNewImageSelected(true); 
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
      body: JSON.stringify({
        name,
        bio,
        age,
        location,
        image: uploadedImage,
        sport,
        team,
        level,
        achievements,
        instagram,
        facebook,
        strava,
      }),

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
    <div className="max-w-2xl w-full mx-auto bg-white text-gray-900 rounded-lg shadow p-4 sm:p-6 mt-10">
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
              title="Click to enlarge"
              className="rounded-full border-2 border-blue-500 object-cover shadow-md cursor-pointer transition hover:scale-105"
              onClick={() => setIsModalOpen(true)} // ← new behavior
            />
          )}

          <div>
            <h2 className="text-lg font-semibold">{user.name || 'Your Name'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing((prev) => !prev);
            setNewImageSelected(false);
          }}
          className="text-blue-600 hover:text-blue-800 transition duration-150"
          title={editing ? 'Cancel Edit' : 'Edit Profile'}
        >
          {editing ? <FaTimes className="w-5 h-5" /> : <FaEdit className="w-5 h-5" />}
        </button>
      </div>
          
      {editing && (
  <div className="mb-6">
    <label className="block text-sm font-medium mb-1">Change Profile Picture</label>
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      disabled={loading}
      className="block w-full text-sm text-gray-600"
    />
    {newImageSelected && (
      <p className="text-sm text-green-600 mt-1">New image selected ✓</p>
    )}
  </div>
)}


      <form onSubmit={handleSubmit} className="space-y-8">
          
        {/* === Basic Info Section === */}
<section>
  <h3 className="text-lg font-semibold mb-2 text-gray-700">Basic Information</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
      <label className="block text-sm font-medium mb-1">Age</label>
      <input
        type="number"
        value={age}
        disabled={!editing || loading}
        onChange={(e) => setAge(e.target.value)}
        className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    </div>
    <div className="md:col-span-2">
      <label className="block text-sm font-medium mb-1">Bio</label>
      <textarea
        value={bio}
        disabled={!editing || loading}
        onChange={(e) => setBio(e.target.value)}
        className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    </div>
    <div>
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
</section>
         {/* === Sports Info Section === */}
<section className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-semibold mb-2 text-gray-700">Sports Info</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
    <div>
      <label className="block text-sm font-medium mb-1">Sport</label>
      <input
        type="text"
        value={sport}
        disabled={!editing || loading}
        onChange={(e) => setSport(e.target.value)}
        className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Team</label>
      <input
        type="text"
        value={team}
        disabled={!editing || loading}
        onChange={(e) => setTeam(e.target.value)}
        className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Level</label>
      <select
        value={level}
        disabled={!editing || loading}
        onChange={(e) => setLevel(e.target.value)}
        className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      >
        <option value="">Select level</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
        <option value="Elite">Elite</option>
      </select>
    </div>
  </div>
</section>
      {/* === Social Media Section === */}
<section className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-semibold mb-2 text-gray-700">Socials</h3>
  <div className="space-y-4">

    {/* Instagram */}
    <div className="flex items-center gap-3">
      <FaInstagram className="text-pink-500 w-5 h-5" />
      {editing ? (
        <input
          type="text"
          value={instagram}
          disabled={loading}
          onChange={(e) => setInstagram(e.target.value)}
          className="w-full bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      ) : instagram ? (
        <a href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {instagram}
        </a>
      ) : (
        <span className="text-gray-400 italic">No Instagram</span>
      )}
    </div>

    {/* Facebook */}
    <div className="flex items-center gap-3">
      <FaFacebook className="text-blue-600 w-5 h-5" />
      {editing ? (
        <input
          type="text"
          value={facebook}
          disabled={loading}
          onChange={(e) => setFacebook(e.target.value)}
          className="w-full bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      ) : facebook ? (
        <a href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {facebook}
        </a>
      ) : (
        <span className="text-gray-400 italic">No Facebook</span>
      )}
    </div>

    {/* Strava */}
    <div className="flex items-center gap-3">
      <FaStrava className="text-orange-500 w-5 h-5" />
      {editing ? (
        <input
          type="text"
          value={strava}
          disabled={loading}
          onChange={(e) => setStrava(e.target.value)}
          className="w-full bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      ) : strava ? (
        <a href={strava.startsWith('http') ? strava : `https://www.strava.com/athletes/${strava}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {strava}
        </a>
      ) : (
        <span className="text-gray-400 italic">No Strava</span>
      )}
    </div>

  </div>
</section>



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
            {isModalOpen && (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Profile Image Preview"
    className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center animate-fade-in"
    onClick={() => setIsModalOpen(false)}
  >
          <div className="max-w-3xl max-h-[90vh] p-4">
            <img
              src={image}
              alt="Enlarged Avatar"
              className="rounded-lg shadow-xl object-contain max-h-[90vh] w-full"
            />
          </div>
        </div>
      )}

    </div>
  );
}
