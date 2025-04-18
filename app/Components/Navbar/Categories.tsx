'use client';

import React from 'react'
import Container from '../Container';
import { MdSportsMartialArts } from "react-icons/md";
import { IoMdBasketball } from "react-icons/io";
import { FaFootballBall } from "react-icons/fa";
import { MdOutlineSportsSoccer } from "react-icons/md";
import { FaVolleyballBall } from "react-icons/fa";
import { FaTableTennis } from "react-icons/fa";
import { IoMdTennisball } from "react-icons/io";
import { GiArcheryTarget } from "react-icons/gi";
import { RiBoxingFill } from "react-icons/ri";
import { FaRunning } from "react-icons/fa";
import { FaBaseballBall } from "react-icons/fa";
import CategoryBox from '../CategoryBox';
import { usePathname, useSearchParams } from 'next/navigation';

export const categories = [
    {
        label: 'Taekwondo',
        icon: MdSportsMartialArts,
        description:'This Tournament is for Taekwondo'
    },
    {
        label: 'Basketball',
        icon: IoMdBasketball,
        description:'This Tournament is for Basketball'
    },
    {
        label: 'Football',
        icon: FaFootballBall,
        description:'This Tournament is for Football'
    },
    {
        label: 'Soccer',
        icon: MdOutlineSportsSoccer,
        description:'This Tournament is for Soccer'
    },
    {
        label: 'Volleyball',
        icon: FaVolleyballBall,
        description:'This Tournament is for Volleyball'
    },
    {
        label: 'Table Tennis',
        icon: FaTableTennis,
        description:'This Tournament is for Table Tennis'
    },
    {
        label: 'Tennis',
        icon: IoMdTennisball,
        description:'This Tournament is for Tennis'
    },
    {
        label: 'Archery',
        icon: GiArcheryTarget,
        description:'This Tournament is for Archery'
    },
    {
        label: 'Boxing',
        icon: RiBoxingFill,
        description:'This Tournament is for Boxing'
    },
    {
        label: 'Athletics',
        icon: FaRunning,
        description:'This Tournament is for Athletics'
    },
    {
        label: 'Baseball',
        icon: FaBaseballBall,
        description:'This Tournament is for Baseball'
    },
    {
        label: 'Others',
        icon: FaBaseballBall,
        description:'This Tournament is for Baseball'
    },
    
    

]

const Categories = () => {
    const params = useSearchParams();
    const category = params?.get('category');
    const pathname = usePathname();

    const isMainPage = pathname === '/';

    if(!isMainPage){
        return null;
    }

  return (
    <Container>
        <div
        className='
            pt-4
            flex
            flex-row
            items-center
            justify-between
            overflow-x-auto
        '>
            {categories.map((item)=>(
                <CategoryBox
                    key={item.label}
                    label={item.label}
                    selected={category === item.label}
                    icon={item.icon}
                />
            ))}
        </div>
    </Container>

  )
}

export default Categories
