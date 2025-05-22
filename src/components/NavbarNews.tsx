// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { UserButton } from "@clerk/nextjs";
import AuthenticationNews from "./AuthenticationNews";

interface NavbarProps {
  isSignedIn: boolean;
}

export default function Navbar({ isSignedIn }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-primary-700 text-[#17488D] py-4 px-6 sm:px-10 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/logo-news.svg" alt="GeoVest Logo" width={42} height={42} />
          </Link>
          <div className="ml-8 hidden md:flex space-x-10">
            <Link
              href="/map"
              className="text-[#17488D] hover:text-[#376ab1] transition-colors font-inter font-semibold"
            >
              Map
            </Link>
            <Link
              href="/news"
              className="text-[#17488D] hover:text-[#376ab1] transition-colors font-inter font-semibold"
            >
              News
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex">
            {!isSignedIn && <AuthenticationNews />}
            {isSignedIn && <UserButton />}
          </div>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-[#17488D] focus:outline-none">
              {isOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 space-y-4">
          <Link
            href="/map"
            className="block py-2 px-4 hover:bg-primary-600 transition-colors font-inter font-semibold rounded-md"
          >
            Map
          </Link>
          <Link
            href="/news"
            className="block py-2 px-4 hover:bg-primary-600 transition-colors font-inter font-semibold rounded-md"
          >
            News
          </Link>
          {!isSignedIn && (
            <div className="flex flex-col">
              <AuthenticationNews isMobileMenu={true} />
            </div>
          )}
          {isSignedIn && <UserButton />}
        </div>
      )}
    </nav>
  );
}

