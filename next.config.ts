const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
  {
      protocol: 'https',
      hostname: 'avatars.githubusercontent.com',
    },
  ],
  },
};

export default nextConfig;
