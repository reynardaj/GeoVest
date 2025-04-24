// This goes in src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Authentication from "../../components/AuthenticationDashboard";
import Image from "next/image";
import ChartDashboard from "../../components/Chart";
import PropertyCard from "../../components/propertycard";

// Define TypeScript interfaces for our data
interface Property {
  image: string;
  title: string;
  location: string;
  price: number;
  category: string;
  landArea: number;
  buildingArea: number;
  status: string;
  certificateType: string;
  propertyUrl: string;
  coordinates?: [number, number, number];
  fund: string;
}

interface FormData {
  fund?: string;
  location?: string;
  variety?: string[];
  [key: string]: any;
}

interface GeoJSONFeature {
  type: string;
  id?: number; // Add this line
  geometry: {
    coordinates: [number, number, number]; // [longitude, latitude, propertyId]
    type: string;
  };
  properties: {
    property_name: string;
    property_category: string;
    property_status: string;
    property_price: number;
    building_area: number;
    land_area: number;
    certificate_type: string;
    property_url: string;
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

export default function Dashboard() {
  const { user } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData | null>(null);

  // Fetch properties from geojson file and user preferences
  useEffect(() => {
    // Get stored form data if available
    const storedFormData = localStorage.getItem("formData");

    // Fetch properties from geojson
    fetch("/properties.geojson")
      .then((response) => response.json())
      .then((data: GeoJSONData) => {
        const propertiesFromGeoJSON: Property[] = data.features.map(
          (feature: GeoJSONFeature, index) => {
            const { properties: prop, geometry } = feature;
            // Use the feature ID or fall back to the index
            const propertyId = feature.id || index;
            return {
              image: prop.property_url || "/property/property1.png",
              title: prop.property_name,
              location: prop.property_name.split(",")[1]
                ? prop.property_name.split(",")[1].trim()
                : "Jakarta",
              price: prop.property_price,
              category: prop.property_category,
              landArea: prop.land_area,
              buildingArea: prop.building_area,
              status: prop.property_status,
              certificateType: prop.certificate_type,
              propertyUrl: prop.property_url,
              // Include the property ID in the coordinates for use in map focusing
              coordinates: [
                geometry.coordinates[0],
                geometry.coordinates[1],
                propertyId,
              ],
              fund: getPriceRange(prop.property_price),
            };
          }
        );

        if (storedFormData) {
          const parsedFormData: FormData = JSON.parse(storedFormData);
          setFormData(parsedFormData);

          // Filter properties based on form data
          const recommended = recommendProperties(
            propertiesFromGeoJSON,
            parsedFormData
          );
          setProperties(recommended);
        } else {
          // If no form data, show all properties
          setProperties(propertiesFromGeoJSON);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching properties:", error);
        setLoading(false);
      });
  }, []);

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString("id-ID")},00`;
  };

  // Helper function to get price range category for matching with form data
  const getPriceRange = (price: number): string => {
    if (price < 100000000) return "< 100 Juta";
    if (price < 500000000) return "100-500 Juta";
    if (price < 1000000000) return "500 Juta-1 M";
    if (price < 5000000000) return "1-5 M";
    return "> 5 M";
  };

  // Function to recommend properties based on form data
  const recommendProperties = (
    allProperties: Property[],
    formData: FormData
  ): Property[] => {
    // Start with all properties
    let filtered = [...allProperties];

    // Apply filters based on form data
    if (formData.fund) {
      filtered = filtered.filter((property) => property.fund === formData.fund);
    }

    if (formData.location && formData.location.length > 0) {
      filtered = filtered.filter((property) =>
        property.location
          .toLowerCase()
          .includes(formData.location!.toLowerCase())
      );
    }

    if (formData.variety && formData.variety.length > 0) {
      filtered = filtered.filter((property) =>
        formData.variety!.some((v: string) =>
          property.category.toLowerCase().includes(v.toLowerCase())
        )
      );
    }

    // If no matches, return all properties
    if (filtered.length === 0) {
      return allProperties;
    }

    return filtered;
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-[#B0E0F9] via-[#f9f9f9] to-[#91E0B5]">
      <nav className="z-20 sticky top-0 flex items-center justify-between px-10 py-4 w-full bg-[#f9f9f9] border border-b-[2px] border-[#b8ccdc] backdrop-blur">
        <div className="flex items-center">
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
          <h2 className="text-xl font-bold text-[#17488D]">
            {formData
              ? "Rekomendasi Properti Berdasarkan Profil Anda"
              : "Rekomendasi Properti Anda"}
          </h2>

          {loading ? (
            <div className="w-full text-center py-12">
              <p className="text-[#17488D]">Memuat properti...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {properties.length > 0 ? (
                properties.map((prop, index) => {
                  return <PropertyCard key={index} {...prop} />;
                })
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-[#17488D]">
                    Tidak ada properti yang sesuai dengan kriteria Anda saat
                    ini.
                  </p>
                  <Link href="/form">
                    <button className="mt-4 bg-[#17488D] text-white px-4 py-2 rounded-xl">
                      Coba Ubah Preferensi Anda
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Analytics */}
        <div className="space-y-6">
          <ChartDashboard />
        </div>
      </div>
    </div>
  );
}
