// app/Components/Avatar.tsx

'use client';
import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src: string | null | undefined;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ src, size = 60 }) => {
  return (
    <Image
      className="rounded-full object-cover"
      height={size}
      width={size}
      alt="Avatar"
      src={src || "/images/noprofile.png"} // Make sure this image exists!
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/images/noprofile.png";
      }}
    />
  );
};

export default Avatar;
