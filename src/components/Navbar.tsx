import Link from "next/link"
import Authentication from "./Authentication"
import Image from "next/image"

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-4 w-full">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="GeoVest Logo" width={42} height={42} />
        </Link>
        <div className="ml-8 hidden md:flex space-x-10">
          <Link href="/map" className="text-white hover:text-gray-200 transition-colors font-inter font-semibold">
            Map
          </Link>
          <Link href="/news" className="text-white hover:text-gray-200 transition-colors font-inter font-semibold">
            News
          </Link>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Authentication />
      </div>
    </nav>
  )
}

