import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 z-10 items-center justify-between px-10 py-4 w-full">
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/logo.svg" alt="GeoVest Logo" width={42} height={42} />
        </Link>
        <div className="ml-8 hidden md:flex space-x-10">
          <Link
            href="/map"
            className="text-[#ffffff] hover:text-[#ebebeb] transition-colors font-inter font-semibold"
          >
            Map
          </Link>
          <Link
            href="/news"
            className="text-[#ffffff] hover:text-[#ebebeb] transition-colors font-inter font-semibold"
          >
            News
          </Link>
        </div>
      </div>
    </nav>
  );
}
