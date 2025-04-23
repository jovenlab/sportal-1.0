"use client";

import React from "react";
import Modal from "./Modal";
import useRentModal from "@/app/hooks/useRentModal";
import { useState, useMemo } from "react";
import Heading from "../Heading";
import { categories } from "../Navbar/Categories";
import CategoryInput from "../inputs/CategoryInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import CountrySelect from "../inputs/CountrySelect";
import dynamic from "next/dynamic";
import Counter from "../inputs/Counter";
import DatePicker from "../inputs/DatePicker";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Resolver } from "dns";

enum STEPS {
  CATEGORY = 0,
  CUSTOM_CATEGORY = 1, // Step for custom category
  LOCATION = 2,
  INFO = 3,
  CUSTOM_CRITERIA = 4, // New step for custom participant criteria
  IMAGES = 5,
  DESCRIPTION = 6,
  PRICE = 7,
}

const RentModal = () => {
  const router = useRouter();
  const rentModal = useRentModal();

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      category: "",
      customCategory: "",
      location: null,
      guestCount: 1,
      roomCount: 1,
      bathroomCount: 1,
      imageSrc: "",
      price: 1,
      title: "",
      description: "",
      tournamentDate: "",
      customCriteria: [] as { name: string; type: string }[], // Array to store custom criteria
    },
  });

  const category = watch("category");
  const customCategory = watch("customCategory");
  const location = watch("location");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const bathroomCount = watch("bathroomCount");
  const imageSrc = watch("imageSrc");
  const customCriteria = watch("customCriteria");

  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
        ssr: false,
      }),
    [location]
  );

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onBack = () => {
    if (step === STEPS.CUSTOM_CRITERIA) {
      setStep(STEPS.INFO); // Go back to the info step
    } else if (step === STEPS.CUSTOM_CATEGORY) {
      setStep(STEPS.CATEGORY); // Go back to the category selection
    } else {
      setStep((value) => value - 1);
    }
  };

  const onNext = () => {
    if (step === STEPS.CATEGORY) {
      if (category === "Custom") {
        setStep(STEPS.CUSTOM_CATEGORY); // Move to custom category step
      } else {
        setStep(STEPS.LOCATION); // Skip directly to location step
      }
    } else {
      setStep((value) => value + 1);
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.PRICE) {
      return onNext();
    }
    setIsLoading(true);

    const finalData = {
      ...data,
      category: data.category || data.customCategory, // Use customCategory if provided
    };

    axios
      .post("/api/listings", finalData)
      .then(() => {
        toast.success("Listing Created!");
        router.refresh();
        reset();
        setStep(STEPS.CATEGORY);
        rentModal.onClose();
      })
      .catch(() => {
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return "Create";
    }
    return "Next";
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }
    return "Back";
  }, [step]);

  let bodyContent;

  if (step === STEPS.CATEGORY) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Which sport category does your tournament belong to?"
          subtitle="Pick a category or select 'Custom' to define your own."
        />
        <div
          className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-3
                    max-h-[50vh]
                    overflow-y-auto
                "
        >
          {categories.map((item) => (
            <div key={item.label} className="col-span-1">
              <CategoryInput
                onClick={(selectedCategory) => {
                  if (selectedCategory === "Custom") {
                    setStep(STEPS.CUSTOM_CATEGORY); // Move to custom category step
                  } else {
                    setCustomValue("category", selectedCategory);
                    onNext(); // Skip directly to location step
                  }
                }}
                selected={category === item.label}
                label={item.label}
                icon={item.icon}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === STEPS.CUSTOM_CATEGORY) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Define Your Custom Category"
          subtitle="Enter the criteria or description for your custom category."
        />
        <Input
          id="customCategory"
          label="Custom Category"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          center
          title="Where is the tournament going to take place?"
          subtitle="Enter the location!"
        />

        <CountrySelect
          value={location}
          onChange={(value) => setCustomValue("location", value)}
        />

        <Map center={location?.latlng} />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          center
          title="Make arrangements for the Tournament"
          subtitle="Provide some information!"
        />
        <Counter
          title="Teams"
          subtitle="How many teams do you allow?"
          value={guestCount}
          onChange={(value) => setCustomValue("guestCount", value)}
        />
        <hr />
        {/* Tournament Date Picker */}
        {/* <DatePicker title="Date"
                        subtitle="When does the tournament begin?"
                        value={Date} 
                        onChange={(date) => setCustomValue('Date', date)} /> */}
        <Input
          id="tournamentDate"
          label="Tournament Date (Ex. 02/08/2025)"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        {/* <hr />
                <Counter
                    title="Rooms"
                    subtitle="How many rooms do you have?"
                    value={roomCount}
                    onChange={(value) => setCustomValue('roomCount', value)}
                /> */}
        {/* <hr />
                <Counter
                    title="Bathrooms"
                    subtitle="How many bathrooms do you have?"
                    value={bathroomCount}
                    onChange={(value) => setCustomValue('bathroomCount', value)}
                /> */}
      </div>
    );
  }

  if (step === STEPS.CUSTOM_CRITERIA) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add Custom Participant Criteria"
          subtitle="Define additional fields that participants must fill out."
        />
        <div className="space-y-4">
          {customCriteria.map(
            (criterion: { name: string; type: string }, index: number) => (
              <div key={index} className="flex gap-4 items-center">
                <Input
                  id={`customCriteria.${index}.name`}
                  label="Field Name"
                  value={criterion.name}
                  onChange={(e) => {
                    const updatedCriteria = [...customCriteria];
                    updatedCriteria[index].name = e.target.value;
                    setCustomValue("customCriteria", updatedCriteria);
                  }}
                  required
                />
                <select
                  value={criterion.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const updatedCriteria: { name: string; type: string }[] = [
                      ...customCriteria,
                    ];
                    updatedCriteria[index].type = e.target.value;
                    setCustomValue("customCriteria", updatedCriteria);
                  }}
                  className="border rounded px-2 py-1"
                >
                  <option value="string">String</option>
                  <option value="integer">Integer</option>
                  <option value="float">Float</option>
                  <option value="date">Date</option>
                </select>
                <button
                  onClick={() => {
                    const updatedCriteria: { name: string; type: string }[] =
                      customCriteria.filter((_: any, i: number) => i !== index);
                    setCustomValue("customCriteria", updatedCriteria);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )
          )}
          <button
            onClick={() => {
              setCustomValue("customCriteria", [
                ...customCriteria,
                { name: "", type: "string" },
              ]);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Criterion
          </button>
        </div>
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading center title="Upload Tournament Picture" />
        <ImageUpload
          value={imageSrc}
          onChange={(value) => setCustomValue("imageSrc", value)}
        />
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          center
          title="How would you describe the tournament?"
          subtitle="Concise and detailed works best!"
        />
        <Input
          id="title"
          label="Title"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <hr />
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Now, Set an Entrance Fee"
          subtitle="How much does the entrance fee cost?"
        />
        <Input
          id="price"
          label="Price"
          formatPrice
          type="number"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  return (
    <Modal
      isOpen={rentModal.isOpen}
      onClose={rentModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      title="Create Tournament"
      body={bodyContent}
    />
  );
};

export default RentModal;
