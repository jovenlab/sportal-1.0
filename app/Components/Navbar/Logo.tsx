'use client';

import Image from "next/image";
import {useRouter} from "next/navigation"

const Logo = () => {
    const router = useRouter();

    return(
        <Image
        onClick={()=>router.push('/')}
        alt="Logo"
        className="hidden md:block cursor-pointer"
        height="130"
        width="130"
        src="/images/sportal_logo.png"
        />
    )
}

export default Logo