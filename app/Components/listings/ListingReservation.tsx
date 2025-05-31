"use client";
import React, { useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { Range } from "react-date-range";
import { categories } from "../Navbar/Categories";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";

import Calendar from "../inputs/Calendar";
import Button from "../Button";
import Input from "../inputs/Input";
import PaymentModal from "../modals/PaymentModal";

interface ListingReservationProps {
  price: number;
  dateRange: Range;
  totalPrice: number;
  onChangeDate: (value: Range) => void;
  onSubmit: (data: any) => void;
  disabled?: boolean;
  disabledDates: Date[];
  category: string;
  listingId: string;
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
  listingId,
}) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      teamName: "",
      teamRepName: "",
      teamRepRole: "",
      contactNumber: "",
      emailAddress: "",
      fullName: "",
    },
  });

  const handleReservationSubmit = (data: FieldValues) => {
    setFormData(data);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
      <div className="flex flex-row items-center gap-1 p-4">
        <div className="text-2xl font-semibold">₱ {price}</div>
        <div className="font-light text-neutral-600">Entrance Fee</div>
      </div>
      <hr />
      {/* <Calendar
        value={dateRange}
        disabledDates={disabledDates}
        onChange={(value) => onChangeDate(value.selection)}
      /> */}
      <hr />
      <form onSubmit={handleSubmit(handleReservationSubmit)}>
        {category === "Basketball" && (
          <div className="p-4 space-y-4">
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

        {category !== "Basketball" && (
          <div className="p-4 space-y-4">
            <Input
              id="teamName"
              label="Team Name"
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
            <Input
              id="fullName"
              label="Full Name"
              register={register}
              errors={errors}
              required
            />
          </div>
        )}

        <div className="p-4">
          <Button
            disabled={disabled}
            label="Reserve a Spot"
            onClick={() => {}} // prevent form double trigger
          />
        </div>
      </form>

      <hr />
      <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg">
        <div>Total</div>
        <div>₱ {totalPrice}</div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalPrice={totalPrice}
        listingId={listingId}
        reservationData={{
          ...formData,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }}
      />
    </div>
  );
};

export default ListingReservation;
