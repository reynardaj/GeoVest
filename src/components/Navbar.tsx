import Link from "next/link"
import Authentication from "./Authentication";
import Image from "next/image";

async function Navbar() {  
  return (
    <nav>
        <div className="max-w-8xl px-14 py-3">
            <div className="flex items-center justify-between h-20">
                <div className="flex items-center mx-3 space-x-14 text-white">
                    <Link href="/">
                        <Image src="/logo-geovest.svg" alt="Geovest Logo" width={50} height={40} />
                    </Link>
                    
                    <Link href='/map/'>
                        <p className="font-inter font-bold text-[16px] leading-[19.36px] tracking-[0]">Map</p>
                    </Link>
                   
                    <Link href='/news/'>
                        <p className="font-inter font-bold text-[16px] leading-[19.36px] tracking-[0]">News</p>
                    </Link>
                </div>

                <Authentication />
            </div>
        </div>
    </nav>
  )
}

export default Navbar
