'use client';
import React from 'react'

interface MenuItemProps {
  onClick: () => void;
  label: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  onClick,
  label
}) => {
  return (
    <div
      onClick={onClick}
      className='
        px-4
        py-3
        hover:bg-neutral-100
        dark:hover:bg-neutral-700
        transition
        font-semibold
        text-black dark:text-white
        cursor-pointer
      '
    >
      {label}
    </div>
  )
}

export default MenuItem;
