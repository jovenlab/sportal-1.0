'use client';
import React from 'react'
import {SafeUser} from "../types";
import { AiOutlineLike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";
import useFavorite from '../hooks/useFavorite';

interface HeartButtonProps{
    listingId:string;
    currentUser?: SafeUser | null;
}

const HeartButton:React.FC<HeartButtonProps> = ({
    listingId,
    currentUser
}) => {
    const {hasFavorited, toggleFavorite} = useFavorite({
        listingId,
        currentUser
    });

    return (
        <div
            onClick={toggleFavorite}
            className='
                relative
                hover:opacity-80
                transtion
                cursor-pointer
            '
        >
            <AiOutlineLike
                size={28}
                className='
                    fill-white
                    absolute
                    -top-[2px]
                    -right-[2px]
                '
            />
            <AiFillLike 
                size={24}
                className={
                    hasFavorited? 'fill-sky-500' : 'fill-neutral-500/70'
                }
            />

        </div>
    )

  return (
    <div>HeartButton</div>
  )
}

export default HeartButton