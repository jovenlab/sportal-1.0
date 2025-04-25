'use client';
import React from 'react'
import Container from '../Container'
import Logo from './Logo'
import Search from './Search'
import UserMenu from './UserMenu'
import {SafeUser} from "@/app/types"
import Categories from './Categories';
import DarkModeToggle from "../DarkModeToggle";

interface NavbarProps{
    currentUser?: SafeUser | null;
}

const Navbar: React.FC<NavbarProps> = ({
    currentUser
}) => {
    console.log({currentUser});
    return (
        <div className='fixed w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-black dark:text-white z-10 shadow-sm'>
            <div className='py-4 border-b-[1px]'>
                <Container>
                <div
                    className='
                        flex
                        flex-row
                        items-center
                        justify-between
                        gap-3
                        md:gap-0
                    '>
                    <Logo />

                    <div className="flex flex-row items-center gap-3">
                        <Search />
                        <DarkModeToggle />
                    </div>

                    <UserMenu currentUser={currentUser} />
                    </div>
                </Container>
            </div>
            <Categories/>
        </div>
  )
}

export default Navbar