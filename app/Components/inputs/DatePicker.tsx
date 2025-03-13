"use client";

import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
    title: string;
    subtitle:string;
    value: Date | null;
    onChange: (date: Date | null) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ title, subtitle, value, onChange }) => {
    return (
    <div className='flex flex-row items-center justify-between'>
        <div className='flex flex-col'>
            <div className='font-medium'>
                {title}
            </div>

            <div className='font-light text-gray-600'>
                {subtitle}
            </div>
        </div>
        <div className='flex flex-row items-center gap-4'>

            <div className='font-light text-xl text-neutral-600'>
                <ReactDatePicker
                    selected={value}
                    onChange={onChange}
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()} // Prevent selecting past dates
                    className="w-40 p-2 border rounded-md text-center"
                />
            </div>

        </div>
    </div>
    );
};

export default DatePicker;
