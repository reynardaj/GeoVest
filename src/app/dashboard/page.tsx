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

const CRITERIA_WEIGHTS = {
  price: 0.25,
  location: 0.25,
  category: 0.15,
  landArea: 0.1,
  buildingArea: 0.1,
  income: 0.05,
  plan: 0.05,
  time: 0.05
};

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData | null>(null);

  useEffect(() => {
    const fetchUserFormData = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_form')
          .select('*')
          .eq('userid', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user form data:', error);
          if (error.code === 'PGRST116') {
            router.push('/form');
            return;
          }
          return;
        }

        if (!data) {
          router.push('/form');
          return;
        }
        
        if (data) {
          setUserFormData(data);
          
          const parsedFormData: FormData = {
            fund: data.fund,
            location: data.location,
            variety: data.variety ? data.variety.split(',') : [],
            plan: data.plan,
            time: data.time,
            facility: data.facility
          };
          
          setFormData(parsedFormData);
          localStorage.setItem("formData", JSON.stringify(parsedFormData));
        }
      } catch (error) {
        console.error('Error in fetching user data:', error);
      }
    };

    fetchUserFormData();

    fetch("/properties.geojson")
      .then((response) => response.json())
      .then((data: GeoJSONData) => {
        const propertiesFromGeoJSON: Property[] = data.features.map(
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
              fund: getPriceRange(prop.property_price),
            };
          }
        );

        const allProperties = [...propertiesFromGeoJSON];
        
        if (userFormData) {
          const recommended = recommendPropertiesWithMCDA(
            allProperties,
            userFormData
          );
          setProperties(recommended);
        } else {
          const storedFormData = localStorage.getItem("formData");
          if (storedFormData) {
            const parsedFormData: FormData = JSON.parse(storedFormData);
            setFormData(parsedFormData);
  
            const recommended = recommendProperties(
              propertiesFromGeoJSON,
              parsedFormData
            );
            setProperties(recommended);
          } else {
            setProperties(propertiesFromGeoJSON);
          }
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching properties:", error);
        setLoading(false);
      });
  }, [user?.id, userFormData]);

  const getPriceRange = (price: number): string => {
    if (price < 100000000) return "< 100 Juta";
    if (price < 500000000) return "100-500 Juta";
    if (price < 1000000000) return "500 Juta-1 M";
    if (price < 5000000000) return "1-5 M";
    return "> 5 M";
  };

  const recommendProperties = (
    allProperties: Property[],
    formData: FormData
  ): Property[] => {
    let filtered = [...allProperties];

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

    if (filtered.length === 0) {
      return allProperties;
    }

    return filtered;
  };

  const recommendPropertiesWithMCDA = (
    allProperties: Property[],
    userData: UserFormData
  ): Property[] => {
    const fundRanks = {
      "< 100 Juta": 1,
      "100-500 Juta": 2,
      "500 Juta-1 M": 3,
      "1-5 M": 4,
      "> 5 M": 5
    };
    
    const incomeRanks = {
      "< 1 Juta": 1,
      "1-5 Juta": 2,
      "5-10 Juta": 3,
      "10-50 Juta": 4,
      "50-100 Juta": 5,
      "100+ Juta": 6
    };
    
    const timeRanks = {
      "< 1 Tahun": 1,
      "1-3 Tahun": 2,
      "3-5 Tahun": 3,
      "> 5 Tahun": 4,
      "Belum Menentukan": 2.5
    };
    
    const locations = [
      "Jakarta Barat", 
      "Jakarta Utara", 
      "Jakarta Selatan", 
      "Jakarta Timur", 
      "Jakarta Pusat"
    ];
    
    const varietyTypes = [
      "Residensial", 
      "Komersial",
      "Properti Campuran"
    ];
    
    const facilityTypes = [
      "Rumah Sakit", 
      "Transportasi Umum"
    ];
    
    let eligible = [...allProperties];
    
    const locationKeywords = locations.reduce((acc, loc) => {
      const words = loc.toLowerCase().split(' ');
      return [...acc, ...words, loc.toLowerCase()];
    }, [] as string[]);
    
    const scoredProperties = eligible.map(property => {
      let score = 0;
      
      if (userData.fund && property.fund) {
        if (property.fund === userData.fund) {
          score += CRITERIA_WEIGHTS.price;
        } else {
          const userFundRank = fundRanks[userData.fund as keyof typeof fundRanks] || 3;
          const propertyFundRank = fundRanks[property.fund as keyof typeof fundRanks] || 3;
          const fundProximity = 1 - Math.min(Math.abs(userFundRank - propertyFundRank) / 4, 1);
          score += CRITERIA_WEIGHTS.price * fundProximity;
          if (propertyFundRank < userFundRank) {
            score += 0.05;
          }
        }
      }
      
      if (userData.location && property.location) {
        const propertyLocationLower = property.location.toLowerCase();
        
        if (propertyLocationLower.includes(userData.location.toLowerCase())) {
          score += CRITERIA_WEIGHTS.location;
        } else {
          let maxLocationMatch = 0;
          locationKeywords.forEach(keyword => {
            if (propertyLocationLower.includes(keyword)) {
              maxLocationMatch = Math.max(maxLocationMatch, 0.5);
            }
            
            if (keyword === "jakarta" && propertyLocationLower.includes(keyword)) {
              maxLocationMatch = Math.max(maxLocationMatch, 0.3);
            }
          });
          
          score += CRITERIA_WEIGHTS.location * maxLocationMatch;
        }
      }
      
      if (userData.variety && property.category) {
        const varietyList = userData.variety.split(',').map(v => v.trim().toLowerCase());
        const propertyCategoryLower = property.category.toLowerCase();
        
        let varietyMatchScore = 0;
        varietyList.forEach(variety => {
          if (propertyCategoryLower.includes(variety)) {
            varietyMatchScore = 1;
          } else {
            if ((variety === "residensial" && 
                (propertyCategoryLower.includes("rumah") || 
                 propertyCategoryLower.includes("apartment") || 
                 propertyCategoryLower.includes("kondominium"))) ||
                (variety === "komersial" && 
                (propertyCategoryLower.includes("toko") || 
                 propertyCategoryLower.includes("kantor") || 
                 propertyCategoryLower.includes("ruko")))) {
              varietyMatchScore = Math.max(varietyMatchScore, 0.7);
            }
          }
        });
        
        score += CRITERIA_WEIGHTS.category * varietyMatchScore;
      }
      
      const maxLandArea = Math.max(...eligible.map(p => p.landArea || 0));
      if (maxLandArea > 0 && property.landArea) {
        score += CRITERIA_WEIGHTS.landArea * (property.landArea / maxLandArea);
      }
      
      const maxBuildingArea = Math.max(...eligible.map(p => p.buildingArea || 0));
      if (maxBuildingArea > 0 && property.buildingArea) {
        score += CRITERIA_WEIGHTS.buildingArea * (property.buildingArea / maxBuildingArea);
      }
      
      if (userData.plan && property.status) {
        if (userData.plan === "KPR" && property.status === "Dijual") {
          score += CRITERIA_WEIGHTS.plan;
        } 
        else if (userData.plan === "Tunai" && property.price < 1000000000) {
          score += CRITERIA_WEIGHTS.plan;
        }
        else if (userData.plan === "Belum Memutuskan") {
          score += CRITERIA_WEIGHTS.plan * 0.5;
        }
      }
      
      if (userData.income && userData.fund) {
        const incomeRank = incomeRanks[userData.income as keyof typeof incomeRanks] || 3;
        const fundRank = fundRanks[userData.fund as keyof typeof fundRanks] || 3;
        
        if (property.fund) {
          const propertyFundRank = fundRanks[property.fund as keyof typeof fundRanks] || 3;
          
          if (incomeRank <= 3 && propertyFundRank <= fundRank) {
            score += CRITERIA_WEIGHTS.income;
          }
          else if (incomeRank >= 4 && propertyFundRank === fundRank) {
            score += CRITERIA_WEIGHTS.income;
          }
          else if (Math.abs(propertyFundRank - fundRank) <= 1) {
            score += CRITERIA_WEIGHTS.income * 0.5;
          }
        }
      }
      
      if (userData.time && property.status) {
        const timeRank = timeRanks[userData.time as keyof typeof timeRanks] || 2.5;
        
        if (timeRank === 1 && property.status === "Siap Huni") {
          score += CRITERIA_WEIGHTS.time;
        }
        else if (timeRank >= 3 && 
                (property.status === "Siap Huni" || property.status === "Dalam Pembangunan")) {
          score += CRITERIA_WEIGHTS.time;
        }
        else {
          score += CRITERIA_WEIGHTS.time * 0.5;
        }
      }
      
      if (userData.job) {
        if (userData.job === "Pengusaha" && property.category.toLowerCase().includes("komersial")) {
          score += 0.05;
        }
        else if (userData.job === "Mahasiswa" && property.category.toLowerCase().includes("residensial")) {
          score += 0.05;
        }
      }
      
      if (userData.age) {
        if (userData.age === "18-24" && property.category.toLowerCase().includes("apartemen")) {
          score += 0.05;
        }
        else if (userData.age === "35-44" && property.category.toLowerCase().includes("rumah")) {
          score += 0.05;
        }
      }
      
      if (userData.facility) {
        const userFacilities = userData.facility.split(',').map(f => f.trim().toLowerCase());
        if (userFacilities.includes("rumah sakit") && 
            (property.location.toLowerCase().includes("jakarta selatan") || 
             property.location.toLowerCase().includes("jakarta pusat"))) {
          score += 0.03;
        }
        
        if (userFacilities.includes("transportasi umum") && 
            (property.location.toLowerCase().includes("jakarta pusat") || 
             property.location.toLowerCase().includes("jakarta timur"))) {
          score += 0.03;
        }
      }
      
      return { ...property, mcdaScore: Math.min(score, 1.0) };
    });

    const filteredProperties = scoredProperties
      .filter(property => (property.mcdaScore || 0) >= 0.25)
      .sort((a, b) => (b.mcdaScore || 0) - (a.mcdaScore || 0));
    return filteredProperties;
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-12 overflow-x-hidden">
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
                      {prop.mcdaScore !== undefined && (
                        <div className="absolute top-0 right-0 bg-green-600 text-white px-2 py-1 rounded-bl-lg text-xs font-semibold">
                          Match Score: {(prop.mcdaScore * 100).toFixed(0)}%
                        </div>
                      )}
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