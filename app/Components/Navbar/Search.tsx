'use client';
import useCountries from '@/hooks/useCountries'; 
import useSearchModal from '@/hooks/useSearchModal';
import { differenceInDays } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react'
import { BiSearch } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

const Search = () => {
  const searchModal = useSearchModal();
  const params = useSearchParams();
  const {getByValue} = useCountries();

  const locationValue = params?.get('locationValue');
  const startDate = params?.get('startDate');
  const endDate = params?.get('endDate');
  const guestCount = params?.get('guestCount');
  const router = useRouter();

  const locationLabel = useMemo(()=>{
    if(locationValue){
      return getByValue(locationValue as string)?.label;
    }
     return 'Anywhere';
  },[getByValue,locationValue]);

  const durationLabel = useMemo(()=>{
    if(startDate && endDate){
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      let diff = differenceInDays(end, start);

      if(diff === 0){
        diff = 1
      }
      return `${diff} Days`;
    }

    return 'Any Week'
  },[startDate,endDate]);

  const guestLabel = useMemo(()=>{
    if(guestCount){
      return `${guestCount} Guests`
    }
    return 'Add Guests';
  },[guestCount])

  return (
    <div
      onClick={searchModal.onOpen}
      className='
      border-[1px]
      w-full
      md:w-auto
      py-2
      rounded-full
      shadow-sm
      
      transition
      
      '>
        <div
          className='
            flex
            flex-row
            items-center
            justify-between
        '>
            <div
              onClick={()=>router.push('/properties')}
              className='
                text-sm
                font-semibold
                px-6
                cursor-pointer
                hover:underline
            '>
                {/* {locationLabel} */} My Tournaments
            </div>
                <div
                    onClick={()=>router.push('/trips')}
                    className='
                        hidden
                        sm:block
                        text-sm
                        font-semibold
                        px-6
                        border-x-[1px]
                        flex-1
                        text-center
                        cursor-pointer
                        hover:underline
                    '>
                        {/* {durationLabel} */} My Games
                </div>
                <div className='
                        font-semibold
                        text-sm
                        pl-6
                        pr-2
                        
                        flex
                        flex-row
                        items-center
                        gap-3
                        cursor-pointer
                        hover:underline
                '>
                    <div 
                    onClick={()=>router.push('/favorites')}
                    className='hidden sm:block text-sm font-semibold text-center px-6'>
                      {/* {guestLabel} */} My Favorites
                    </div>
                    {/* <div className='hidden sm:block text-sm font-semibold text-center px-6 border-l-[1px]'>Tournaments</div> */}
                    {/* <div className='
                            p-2
                            bg-sky-500
                            rounded-full
                            text-white
                    '>
                        <BiSearch size={18} />
                    </div> */}
                </div>
        </div>
    </div>
  )
}

export default Search