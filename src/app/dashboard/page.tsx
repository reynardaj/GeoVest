import Link from "next/link"
import Authentication from "../../components/Authentication"
import Image from "next/image"
import { currentUser } from "@clerk/nextjs/server"
import ChartDashboard from '../../components/Chart';
import PropertyCard from "../../components/propertycard";

const properties = [
    {
        image: "/property/property2.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property1.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property2.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property1.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property2.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property1.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property2.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property1.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property2.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property1.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property2.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    {
        image: "/property/property1.png",
        title: "Rumah Perumahan Riviera",
        location: "Tebet, Jakarta Selatan",
        price: "Rp 3.500.000.000,00",
        category: "Rumah",
        profit: "15%",
    },
    // Add more here...
];

export default async function Page() {
    const user = await currentUser();

    return (
        <div className="min-h-screen bg-gradient-to-bl from-[#B0E0F9] via-[#f9f9f9] to-[#91E0B5]">
            <nav className="z-20 sticky top-0 flex items-center justify-between px-10 py-4 w-full bg-[#f9f9f9] border border-b-[2px] border-[#b8ccdc] backdrop-blur">
                <div className="flex items-center">
                    <Link href="/dashboard" className="flex items-center">
                        <Image src="/logo1.svg" alt="GeoVest Logo" width={42} height={42} />
                    </Link>
                    <div className="ml-8 hidden md:flex space-x-10">
                        <Link href="/features" className="text-[#17488D] hover:text-[#5f92d9] transition-colors font-inter font-semibold">
                            Features
                        </Link>
                        <Link href="/map" className="text-[#17488D] hover:text-[#5f92d9] transition-colors font-inter font-semibold">
                            Map
                        </Link>
                        <Link href="/news" className="text-[#17488D] hover:text-[#5f92d9] transition-colors font-inter font-semibold">
                            News
                        </Link>
                    </div>
                </div>
                <div className="flex items-center space-x-4 text-[#17488D]">
                    <Authentication />
                </div>
            </nav>
            <div className="flex items-center w-full h-[100px] bg-[#b8ccdc]">
                <div className="pl-[7%] text-[#17488D] text-[20px] font-semibold">
                    Selamat datang{user ? `, ${user.firstName}!` : ""}
                </div>
            </div>
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-12 overflow-x-hidden">
                {/* Left: Property Cards */}
                <div className="lg:col-span-3 space-y-6 bg-[#ffffff] rounded-xl outline outline-2 outline-[#b8ccdc] px-16 py-12">
                    <h2 className="text-xl font-bold text-[#17488D]">Rekomendasi Properti Anda</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {properties.map((prop, index) => (
                            <PropertyCard key={index} {...prop} />
                        ))}
                    </div>
                </div>
    
                {/* Right: Analytics */}
                <div className="space-y-6">
                    <ChartDashboard />
                </div>
            </div>
        </div>
    );    
}