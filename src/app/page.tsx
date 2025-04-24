import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";

export default function Home() {
  return (
    <main className="min-h-screen bg-landing-image flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4 md:px-8 max-w-7xl mx-auto w-full">
        <Hero />
        <Features />
      </div>
    </main>
  );
}
