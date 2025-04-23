import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="w-full py-8 px-4 md:px-8 lg:px-12 border-t border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-6 md:mb-0">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="GeoVest Logo" width={32} height={32} />
            <span className="ml-2 text-white font-bold font-ubuntu">GeoVest</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
          <Link href="/about" className="text-gray-300 hover:text-white font-ubuntu">
            About Us
          </Link>
          <Link href="/contact" className="text-gray-300 hover:text-white font-ubuntu">
            Contact
          </Link>
          <Link href="/privacy" className="text-gray-300 hover:text-white font-ubuntu">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-gray-300 hover:text-white font-ubuntu">
            Terms of Service
          </Link>
        </div>

        <div className="mt-6 md:mt-0">
          <p className="text-gray-400 text-sm font-ubuntu">
            © {new Date().getFullYear()} GeoVest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

