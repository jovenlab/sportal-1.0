'use client';

import React from 'react'
import Modal from './Modal'
import useRentModal from '@/hooks/useRentModal';
import { useState, useMemo } from 'react';
import Heading from '../Heading';
import { categories } from '../Navbar/Categories';
import CategoryInput from '../inputs/CategoryInput';
import { FieldValues , SubmitHandler, useForm } from "react-hook-form";
import CountrySelect from '../inputs/CountrySelect';
import dynamic from 'next/dynamic';
import Counter from '../inputs/Counter';
import ImageUpload from '../inputs/ImageUpload';
import Input from '../inputs/Input';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Resolver } from 'dns';


enum STEPS{
    CATEGORY = 0,
    LOCATION = 1,
    INFO = 2,
    IMAGES = 3,
    DESCRIPTION = 4,
    PRICE = 5
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
        formState:{
            errors,
        },
        reset
    } = useForm<FieldValues>({
        defaultValues:{
            category:'',
            location: null ,
            guestCount: 1,
            imageSrc: '',
            price: 1,
            title:'',
            description:'',
            tournamentDate: null,
            localAddress: '',
            tournamentType: 'ROUND_ROBIN',
        }
    });

    const category = watch('category');
    const location = watch('location');
    const guestCount = watch('guestCount');
    const imageSrc = watch('imageSrc');
    const tournamentType = watch('tournamentType');

    const Map = useMemo(()=>dynamic(()=> import('../Map'),{
        ssr: false
    }), [location]);

    const setCustomValue = (id:string, value:any) => {
        setValue(id,value,{
            shouldValidate:true,
            shouldDirty:true,
            shouldTouch:true,
        })
    }

    const onBack = () => {
        setStep((value) => value - 1);
    };

    const onNext = () => {
        setStep((value) => value + 1)
    }


    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if(step !== STEPS.PRICE){
            return onNext();
        }
        setIsLoading(true);

        const formattedData = {
            ...data,
            tournamentDate: new Date(data.tournamentDate).toISOString(),
        };

        axios.post('/api/listings', formattedData)
            .then(()=>{
                toast.success('Listing Created!');
                router.refresh();
                reset();
                setStep(STEPS.CATEGORY);
                rentModal.onClose();
            })
            .catch(()=>{
                toast.error("Something went wrong.");
            }).finally(()=>{
                setIsLoading(false);
            })
    }


    const actionLabel = useMemo(() => {
        if(step === STEPS.PRICE){
            return 'Create'
        }
        return 'Next';
    },[step]);

    const secondaryActionLabel = useMemo(() => {
        if(step === STEPS.CATEGORY){
            return undefined;
        }
        return 'Back';
    },[step]);


    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title = "Which of these you want to create?"
                subtitle = "Pick a sport category"
            />

            <div className='
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-3
                    max-h-[50vh]
                    overflow-y-auto
            '>
                {categories.map((item) => (
                    <div key={item.label} className='col-span-1'>
                        <CategoryInput
                            onClick={(category)=>
                                setCustomValue('category',category)}
                            selected={category === item.label}
                            label={item.label}
                            icon={item.icon}
                        />
                    </div>
                ))}
            </div>

        </div>
    )

    if(step === STEPS.LOCATION){
        bodyContent = (
            <div className='flex flex-col gap-8'>
                <Heading
                    center
                    title="Where is the tournament going to take place?"
                    subtitle='Enter the location!'
                />

                <CountrySelect
                    value={location}
                    onChange={(value) => setCustomValue('location', value)}
                />

                <Map
                    center={location?.latlng}
                />
                <Input
                    id="localAddress"
                    label="Local Address (e.g., field name, gym, street)"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />

            </div>
        )
    }

    if(step === STEPS.INFO){
        bodyContent = (
            <div className='flex flex-col gap-8'>
                <Heading
                    center
                    title="Make arrangements for the Tournament"
                    subtitle="Provide some information!"
                />
                <div className="flex flex-col gap-2">
                    <label className="text-md font-semibold">Tournament Type</label>
                    <select
                        id="tournamentType"
                        {...register('tournamentType', { required: true })}
                        disabled={isLoading}
                        value={tournamentType}
                        onChange={(e) =>
                            setCustomValue('tournamentType', e.target.value)
                        }
                        className="border border-neutral-300 rounded-md py-5 px-3"
                    >
                        <option value="ROUND_ROBIN">Round Robin</option>
                        <option value="SINGLE_ELIMINATION">Single Elimination</option>
                    </select>
                    {errors.tournamentType && (
                        <span className="text-sm text-rose-500">
                            Tournament type is required.
                        </span>
                    )}
                </div>
                <hr />
                <Counter
                    title="Teams"
                    subtitle="How many teams do you allow?"
                    value={guestCount}
                    onChange={(value) => setCustomValue('guestCount', value)}
                />
                <hr />
                <Input
                    id="tournamentDate"
                    label="Tournament Date"
                    type="date"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }
    if(step === STEPS.IMAGES){
        bodyContent = (
            <div className='flex flex-col gap-8'>
                <Heading
                    center
                    title="Upload Tournament Picture"
                    
                />
                <ImageUpload
                    value={imageSrc}
                    onChange={(value) => setCustomValue('imageSrc', value)}
                />

            </div>
        )
    }

    if(step === STEPS.DESCRIPTION){
        bodyContent = (
            <div className='flex flex-col gap-8'>
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
        )
    }

    if(step === STEPS.PRICE){
        bodyContent = (
            <div className='flex flex-col gap-8'>
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
        )
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
  )
}

export default RentModal