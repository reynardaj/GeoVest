import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    // 2xl:w-[25%] xl:w-[28%] md:w-[30%]
    <nav className="absolute top-0 left-0 z-10 items-center justify-between px-4 py-2">
      <div className="bg-[#ffffff] flex items-center px-8 py-2 border rounded-xl max-w-max">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/logo1.svg" alt="GeoVest Logo" width={42} height={42} />
        </Link>
        <div className="ml-8 hidden md:flex space-x-10">
          <Link
            href="/map"
            className="text-[#17488D] hover:text-[#5f92d9] transition-colors font-inter font-semibold"
          >
            Map
          </Link>
          <Link
            href="/news"
            className="text-[#17488D] hover:text-[#5f92d9] transition-colors font-inter font-semibold"
          >
            News
          </Link>
        </div>
      </div>
    </nav>
  );
}
