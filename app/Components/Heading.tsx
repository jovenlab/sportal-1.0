'use client';

interface HeadingProps{
    title: string;
    subtitle?: string;
    center?: boolean;
    logo?:string;
}

import React from 'react'

const Heading: React.FC<HeadingProps> = ({
    title,
    subtitle,
    center,
    logo
}) => {
  return (
    <div className={center? 'text-center' : 'text-start'}>
        
        <img className="mx-auto" style={{width:"150px"}} src={logo} alt="" />
        
        <div className="text-2xl font-bold">
            {title}
        </div>
        
        <div className='font-light text-neutral-500 mt-2'>
            {subtitle}
        </div>
    </div>
  )
}

export default Heading