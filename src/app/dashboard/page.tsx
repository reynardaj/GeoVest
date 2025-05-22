"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from '@/lib/supabase'
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChartDashboard from "../../components/Chart";
import PropertyCard from "../../components/propertycard";
import NavbarNews from "@/components/NavbarNews";

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
  mcdaScore?: number;
}

interface UserFormData {
  userid: string;
  fullname: string;
  nickname: string;
  job?: string;
  age?: string;
  income?: string;
  fund?: string;
  plan?: string;
  variety?: string;
  time?: string;
  location?: string;
  facility?: string;
}

interface FormData {
  fund?: string;
  location?: string;
  variety?: string[];
  plan?: string;
  time?: string;
  facility?: string;
  [key: string]: any;
}

interface GeoJSONFeature {
  type: string;
  id?: number;
  geometry: {
    coordinates: [number, number, number];
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
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData | null>(null);

  const getRecommendations = async (
    propertiesData: Property[], 
    userData?: UserFormData, 
    basicFormData?: FormData
  ) => {
    try {
      const requestBody = {
        properties: propertiesData,
        userData: userData,
        formData: basicFormData,
        recommendationType: userData ? 'mcda' : 'basic'
      };

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.properties;
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error calling recommendation API:', error);
      return propertiesData;
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      
      try {
        const { data: userData, error } = await supabase
          .from('user_form')
          .select('*')
          .eq('userid', user.id)
          .single();
        
        if (error && error.code === 'PGRST116') {
          router.push('/form');
          return;
        }

        if (error) {
          console.error('Error fetching user form data:', error);
        }

        const response = await fetch("/properties.geojson");
        const geoData: GeoJSONData = await response.json();
        
        const propertiesFromGeoJSON: Property[] = geoData.features.map(
          (feature: GeoJSONFeature, index) => {
            const { properties: prop, geometry } = feature;
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
              coordinates: [
                geometry.coordinates[0],
                geometry.coordinates[1],
                propertyId,
              ],
              fund: "",
            };
          }
        );

        if (propertiesFromGeoJSON.length === 0) {
          setLoading(false);
          return;
        }

        let recommendedProperties: Property[] = [];
        
        if (userData) {
          setUserFormData(userData);
          
          const parsedFormData: FormData = {
            fund: userData.fund,
            location: userData.location,
            variety: userData.variety ? userData.variety.split(',') : [],
            plan: userData.plan,
            time: userData.time,
            facility: userData.facility
          };
          
          setFormData(parsedFormData);
          localStorage.setItem("formData", JSON.stringify(parsedFormData));
          
          recommendedProperties = await getRecommendations(propertiesFromGeoJSON, userData);
        } else {
          const storedFormData = localStorage.getItem("formData");
          if (storedFormData) {
            const parsedFormData: FormData = JSON.parse(storedFormData);
            setFormData(parsedFormData);
            
            recommendedProperties = await getRecommendations(propertiesFromGeoJSON, undefined, parsedFormData);
          } else {
            recommendedProperties = await getRecommendations(propertiesFromGeoJSON);
          }
        }
        
        setProperties(recommendedProperties);
        
      } catch (error) {
        console.error("Error in dashboard initialization:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user?.id, router]);

  return (
    <div className="min-h-screen bg-gradient-to-bl from-[#B0E0F9] via-[#f9f9f9] to-[#91E0B5]">
      <NavbarNews isSignedIn={!!user} />
      <div className="flex items-center w-full h-[100px] bg-[#b6cade]">
        {userFormData && (
          <div className="pl-[7%] text-[#17488D] text-[20px] font-semibold">
            Selamat datang {userFormData.nickname}!
          </div>
        )}
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 p-10 overflow-x-hidden">
        {/* Left: Property Cards */}
        <div className="lg:col-span-3 space-y-6 bg-white rounded-xl outline outline-2 outline-[#b8ccdc] px-16 py-12">
          <h2 className="text-xl font-bold text-[#17488D]">
            Rekomendasi Properti Anda
          </h2>

          {loading ? (
            <div className="w-full text-center py-12">
              <p className="text-[#17488D]">Memuat properti...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {properties.length > 0 ? (
                properties.map((prop, index) => {
                  return (
                    <div key={index} className="relative flex flex-col h-full">
                      <PropertyCard {...prop} />
                    </div>
                  );
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
          <ChartDashboard properties={properties}/>
          {/* MCDA Info Card */}
          <div className="bg-white p-6 rounded-xl outline outline-2 outline-[#b8ccdc]">
            <h3 className="text-lg font-bold text-[#17488D] mb-3">
              Tentang Rekomendasi
            </h3>
            <p className="text-sm text-gray-700 my-4">
              Rekomendasi properti menggunakan metode <span className="font-medium">Multi-Criteria Decision Analysis</span> untuk mencocokan properti dengan profil Anda.
            </p>
            {userFormData && (
              <div className="rounded-lg text-sm mb-4">
                <h3 className="font-bold text-[#17488D] mb-2">Preferensi Anda</h3>
                <div className="text-[#17488D] grid grid-cols-1 md:grid-cols-2 gap-2">
                  {userFormData.fund && (
                    <div><span className="font-medium">Dana:</span> {userFormData.fund}</div>
                  )}
                  {userFormData.location && (
                    <div><span className="font-medium">Lokasi:</span> {userFormData.location}</div>
                  )}
                  {userFormData.variety && (
                    <div>
                      <span className="font-medium">Jenis Properti:</span>{" "}
                      {(() => {
                        const items = userFormData.variety.split(",").map(item => item.trim());
                        if (items.length === 1) return items[0];
                        return items.slice(0, -1).join(", ") + ", dan " + items[items.length - 1];
                      })()}
                    </div>
                  )}
                  {userFormData.plan && (
                    <div><span className="font-medium">Rencana Pembelian:</span> {userFormData.plan}</div>
                  )}
                  {userFormData.time && (
                    <div><span className="font-medium">Jangka Waktu:</span> {userFormData.time}</div>
                  )}
                </div>
                <div className="mt-4 text-xs text-gray-600">
                  <Link href="/form">
                    <button className="text-blue-600 underline">Klik disini untuk mengubah preferensi</button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}