'use client';

import React from 'react'
import {IconType} from "react-icons";
interface ButtonProps{
    label:string;
    onClick:(e:React.MouseEvent<HTMLButtonElement>) => void;
    disabled?:boolean;
    outline?:boolean;
    small?:boolean;
    icon?:IconType;
    green?:boolean;
}

const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    disabled,
    outline,
    green,
    small,
    icon:Icon
}) => {
  return (
    <button onClick={onClick}
            disabled={disabled}
            className={`
                relative
                disabled:opacity-70
                disabled:cursor-not-allowed
                rounded-lg
                hover:opacity-80
                transition
                w-full
                ${green? 'bg-green-500' : ''}
                ${green? 'border-green-500' : ''}
                ${outline? 'bg-white': 'bg-sky-500'}
                ${outline? 'border-black': 'border-sky-500'}
                ${outline? 'text-black': 'text-white'}
                ${small? 'py-1': 'py-3'}
                ${small? 'text-sm': 'text-md'}
                ${small? 'font-light': 'font-semibold'}
                ${small? 'border-[1px]': 'border-2'}
    `}>
        {Icon && (
            <Icon
                size={24}
                className='
                    absolute
                    left-4
                    top-3
            '/>
        )}
        {label}
    </button>
  )
}

export default Button