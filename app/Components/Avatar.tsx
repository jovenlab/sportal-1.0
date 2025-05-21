'use client';
import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src: string | null | undefined;
}

const Avatar: React.FC<AvatarProps> = ({ src }) => {
  const isBroken = !src || src.includes('your-storage.com');

  return (
    <Image
      className="rounded-full"
      height={30}
      width={30}
      alt="Avatar"
      src={isBroken ? '/images/noprofile.png' : src}
    />
  );
};

export default Avatar;
