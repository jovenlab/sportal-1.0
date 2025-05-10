'use client';
import React from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { Range } from 'react-date-range';

import Calendar from '../inputs/Calendar';
import Button from "../Button";
import Input from '../inputs/Input';

interface ListingReservationProps {
  price: number;
  dateRange: Range;
  totalPrice: number;
  onChangeDate: (value: Range) => void;
  onSubmit: (data: any) => void; // now accepts form data
  disabled?: boolean;
  disabledDates: Date[];
  category: string;
}

const ListingReservation: React.FC<ListingReservationProps> = ({
  price,
  dateRange,
  totalPrice,
  onChangeDate,
  onSubmit,
  disabled,
  disabledDates,
  category,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      teamName: '',
      teamRepName: '',
      teamRepRole: '',
      contactNumber: '',
      emailAddress: '',
      fullName: '',
    },
  });

  const handleReservationSubmit = (data: FieldValues) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleReservationSubmit)}
      className='
        bg-white
        rounded-xl
        border-[1px]
        border-neutral-200
        overflow-hidden
      '
    >
      <div className='flex flex-row items-center gap-1 p-4'>
        <div className='text-2xl font-semibold'>${price}</div>
        <div className='font-light text-neutral-600'>entrance fee</div>
      </div>

      <hr />

      {category === 'Basketball' && (
        <div className='p-4 space-y-4'>
          <Input
            id="teamName"
            label="Team Name"
            register={register}
            errors={errors}
            required
          />
          <Input
            id="teamRepName"
            label="Team Representative"
            register={register}
            errors={errors}
            required
          />
          <Input
            id="teamRepRole"
            label="Team Role"
            register={register}
            errors={errors}
            required
          />
          <Input
            id="contactNumber"
            label="Contact Number"
            register={register}
            errors={errors}
            required
          />
          <Input
            id="emailAddress"
            label="Email Address"
            type="email"
            register={register}
            errors={errors}
            required
          />
        </div>
      )}

      {category !== 'Basketball' && (
        <div className='p-4 space-y-4'>

          <Input
            id="fullName"
            label="Full Name"
            register={register}
            errors={errors}
            required
          />
          <Input
            id="contactNumber"
            label="Contact Number"
            register={register}
            errors={errors}
            required
          />
          <Input
            id="emailAddress"
            label="Email Address"
            type="email"
            register={register}
            errors={errors}
            required
          />
        </div>
      )}

      
      <hr />

      <div className='p-4'>
        <Button
          disabled={disabled}
          label="Reserve a spot"
          onClick={() => {}} // prevent form double trigger
        />
      </div>
    </form>
  );
};

export default ListingReservation;
