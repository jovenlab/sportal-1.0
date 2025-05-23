'use client';
import React from 'react'
import Image from 'next/image'

interface AvatarProps{
  src: string | null | undefined;
}

const Avatar: React.FC<AvatarProps> = ({
  src
}) => {
  return (
    <div className="relative w-8 h-8 rounded-full overflow-hidden">
      <Image
        src={src || "/images/noprofile.png"}
        alt="User Avatar"
        fill
        className="object-cover"
        sizes="32px"
      />
    </div>
  );
};

export default Avatar