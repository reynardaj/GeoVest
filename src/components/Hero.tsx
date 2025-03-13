import { Button } from "@/components/ui/button"
import Link from "next/link"
import Map from "./Map"

export default function Hero() {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between w-full py-12 px-4 md:px-8 lg:px-12">
      <div className="w-full lg:w-1/2 mb-10 lg:mb-0 pr-0 lg:pr-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 font-ubuntu-mono leading-tight">
          Invest Smarter with Geospatial Insights Powered by AI
        </h1>
        <p className="text-lg text-[#f3f3f3] mb-4 font-ubuntu max-w-[30rem]">
          <span className="font-bold">No more hours of research. GeoVest </span>brings you instant, AI-driven insights on property markets, historical
          trends, and price movements, all in one place.
        </p>
        <p className="text-lg text-[#f3f3f3] mb-8 font-ubuntu max-w-[30rem]">
          Make smarter investment decisions effortlessly with real-time geospatial data at your fingertips.
        </p>
        
        <Link href="/map">
          <Button className="w-40 bg-[#B0E0F9] text-[#222222] hover:bg-[#c1e2f5] font-ubuntu font-bold px-8 py-6 text-base rounded-2xl shadow-neutral-950">
            Get Started
          </Button>
        </Link>
        
      </div>
      <div className="w-full lg:w-1/2">
        <div className="rounded-xl overflow-hidden drop-shadow-2xl">
          <Map />
        </div>
      </div>
    </section>
  )
}

