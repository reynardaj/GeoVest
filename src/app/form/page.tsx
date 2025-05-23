'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Piechart from "@/components/PiechartForm";

interface UserTypeData {
    userType: string;
    title: string;
    description: string;
    fallback?: boolean;
}

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

interface FormDatas {
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

export default function form() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [dataSaved, setDataSaved] = useState(false);
    const [step, setStep] = useState(1);
    const [userTypeData, setUserTypeData] = useState<UserTypeData | null>(null);
    const [isLoadingUserType, setIsLoadingUserType] = useState(false);

    const [properties, setProperties] = useState<Property[]>([]);
    const [userFormData, setUserFormData] = useState<UserFormData | null>(null);
    const [piechartProperties, setPiechartProperties] = useState<Property[]>([]);
    const [piechartLoading, setPiechartLoading] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        fullName: "",
        nickname: "",
        job: "",
        age: "",
        income: "",
        fund: "",
        plan: "",
        variety: [] as string[],
        time: "",
        location: "",
        facility: [] as string[]
    });

    const jobs = [
        "Pengusaha", "Karyawan", "Pendidik", "Insinyur", 
        "Mahasiswa", "Perawat", "Lainnya"
    ];

    const ages = [
        "18-24", "25-34", "35-44", "45-54", "55+",
    ];

    const incomes = [
        "< 1 Juta", "1-5 Juta", "5-10 Juta", "10-50 Juta", "50-100 Juta", "100+ Juta"
    ];

    const funds = [
        "< 100 Juta", "100-500 Juta", "500 Juta-1 M", "1-5 M", "> 5 M"
    ]

    const plans = [
        "Tunai", "KPR", "Belum Memutuskan"
    ]

    const varieties = [
        "Residensial", "Komersial", "Properti Campuran", "Properti dengan HGB", "Properti dengan Hak Pakai", "Properti dengan Hak Pengelolaan"
    ];

    const times = [
        "< 1 Tahun", "1-3 Tahun", "3-5 Tahun", "> 5 Tahun", "Belum Menentukan"
    ]

    const locations = [
        "Jakarta Barat", "Jakarta Utara", "Jakarta Selatan", "Jakarta Timur", "Jakarta Pusat"
    ]

    const facilities = [
        "Rumah Sakit", "Transportasi Umum"
    ]

    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };  

    const nextStep = () => {
        if (step === 2 && !formData.fullName.trim()) {
          setError("*Nama lengkap tidak boleh kosong.");
          return;
        }
        if (step === 3 && !formData.nickname.trim()) {
          setError("*Nama panggilan tidak boleh kosong.");
          return;
        }
        
        setError("");
        setStep(step + 1);
    };

    const determineUserType = async () => {
        setIsLoadingUserType(true);
        try {
            const response = await fetch('/api/user_type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ formData })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            if (!text) {
                throw new Error('Empty response from server');
            }

            const data = JSON.parse(text);
            
            if (data.success) {
                setUserTypeData({
                    userType: data.userType,
                    title: data.title,
                    description: data.description,
                    fallback: data.fallback
                });
            } else {
                console.error('Error from API:', data.error);
                setUserTypeData({
                    userType: 'private_investor',
                    title: 'The Private Investor 🧑‍💼',
                    description: 'Pengguna individu yang mencari peluang investasi properti secara mandiri. Biasanya berfokus pada pertumbuhan modal atau penghasilan pasif. Mereka membutuhkan rekomendasi properti yang selaras dengan anggaran pribadi dan horizon waktu investasi tertentu.',
                    fallback: true
                });
            }
        } catch (error) {
            console.error('Error determining user type:', error);
            setUserTypeData({
                userType: 'private_investor',
                title: 'The Private Investor 🧑‍💼',
                description: 'Pengguna individu yang mencari peluang investasi properti secara mandiri. Biasanya berfokus pada pertumbuhan modal atau penghasilan pasif. Mereka membutuhkan rekomendasi properti yang selaras dengan anggaran pribadi dan horizon waktu investasi tertentu.',
                fallback: true
            });
        } finally {
            setIsLoadingUserType(false);
        }
    };

    const saveFormDataToServer = async () => {
        if (!isSignedIn || !user) return;
        
        try {
            const varietyString = formData.variety.join(',');
            const facilityString = formData.facility.join(',');

            const dataToSave = {
                userid: user.id,
                fullname: formData.fullName,
                nickname: formData.nickname,
                job: formData.job,
                age: formData.age,
                income: formData.income,
                fund: formData.fund,
                plan: formData.plan,
                variety: varietyString,
                time: formData.time,
                location: formData.location,
                facility: facilityString
            };

            const { error } = await supabase
                .from('user_form')
                .upsert([dataToSave], {
                    onConflict: 'userid',
                    ignoreDuplicates: false
                });

            if (!error) {
                setDataSaved(true);
            }
        } catch (err) {
            console.error('Error saving form data:', err);
        }
    };

    useEffect(() => {
    const attemptSave = async () => {
        if (step === 13 && !dataSaved && isLoaded && isSignedIn && user) {
            await saveFormDataToServer();
        }
    };
    
    attemptSave();
}, [step, isLoaded, isSignedIn, dataSaved]);

    useEffect(() => {
        const handleUserTypeAndRecommendations = async () => {
            if (step === 13 && dataSaved && !userTypeData && !isLoadingUserType) {
                await determineUserType();
            }
        };
        
        handleUserTypeAndRecommendations();
    }, [step, dataSaved, userTypeData, isLoadingUserType]);

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
        const loadPropertiesWithRecommendations = async () => {
            if (step === 13 && dataSaved && userTypeData && user?.id && !piechartLoading) {
                setPiechartLoading(true);
                
                try {
                    const { data: userData, error } = await supabase
                        .from('user_form')
                        .select('*')
                        .eq('userid', user.id)
                        .single();

                    if (error) {
                        console.error('Error fetching user form data:', error);
                        return;
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
                        setPiechartLoading(false);
                        return;
                    }

                    const recommendedProperties = await getRecommendations(propertiesFromGeoJSON, userData);
                    
                    setProperties(recommendedProperties);
                    setPiechartProperties(recommendedProperties);
                    setUserFormData(userData);
                    
                } catch (error) {
                    console.error("Error loading properties:", error);
                    setProperties([]);
                    setPiechartProperties([]);
                } finally {
                    setPiechartLoading(false);
                }
            }
        };

        loadPropertiesWithRecommendations();
    }, [step, dataSaved, userTypeData, user?.id, piechartLoading]);

    return (
        <div
            className="relative h-screen w-full flex items-center justify-center"
            style={{
                backgroundImage: "linear-gradient(to bottom left, #17488D 5%,rgb(103, 137, 185) 20%, #ddebf3 60%,rgb(210, 231, 220) 80%, #91E0B5 95%)"
            }}
        >
            <img
                src="/logo1.svg"
                alt="Logo"
                width={42} 
                height={42}
                className="absolute top-[1.05rem] left-[2.55rem] z-10"
            />
            <div className="text-center w-full h-full">
                {step === 1 && (
                    <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#17488D] mb-4 text-start">
                                Ayo temukan portfolio terbaik untuk Anda!
                            </h1>
                            <p className="text-sm md:text-base text-[#17488D] mb-8 text-start">
                                Jawab beberapa pertanyaan singkat agar kami dapat merekomendasikan portfolio GeoVest terbaik untuk Anda!
                            </p>

                            <div className="space-y-4 w-full">
                                <button
                                    onClick={nextStep}
                                    className="w-full bg-[#17488D] hover:bg-[#0b2e5e] text-white font-semibold py-2 rounded-xl"
                                >
                                    Mulai
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {step === 2 && (
                    <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                        <div className="w-full text-left text-[35px] font-bold mb-4 text-blue-900">
                            Apa nama lengkap Anda?
                        </div>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={(e) => {
                                handleChange(e);
                                if (e.target.value.trim() !== "") setError("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') nextStep();
                            }}
                            placeholder="Ketik disini..."
                            className="w-full p-3 rounded-xl bg-[#b4c8dd] border border-[#17488D] text-[#17488D] font-semibold placeholder:text-[#17488D] "
                        />
                        {error && (
                            <div className="text-red-600 text-sm font-semibold mt-2 text-left w-full">
                                {error}
                            </div>
                        )}
                        <div className="flex justify-end w-full">
                            <button
                                onClick={nextStep}
                                className="mt-4 px-8 py-2 bg-[#17488D] text-[#ffffff] font-normal rounded-xl hover:bg-[#0b2e5e]"
                            >
                                Lanjut
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                        Apa nama panggilan anda?
                    </div>
                    <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={(e) => {
                            handleChange(e);
                            if (e.target.value.trim() !== "") setError("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') nextStep();
                        }}
                        placeholder="Ketik disini..."
                        className="w-full p-3 rounded-xl bg-[#b4c8dd] border border-[#17488D] text-[#17488D] font-semibold placeholder:text-[#17488D] "
                    />
                    {error && (
                        <div className="text-red-600 text-sm font-semibold mt-2 text-left w-full">
                            {error}
                        </div>
                    )}
                    <div className="w-full flex justify-between">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="mt-4 px-8 py-2 bg-[#17488D] text-[#ffffff] font-normal rounded-xl hover:bg-[#0b2e5e]"
                            >
                            Kembali
                        </button>
                        <button
                            onClick={nextStep}
                            className="mt-4 px-8 py-2 bg-[#17488D] text-[#ffffff] font-normal rounded-xl hover:bg-[#0b2e5e]"
                        >
                            Lanjut
                        </button>
                    </div>
                </div>
                )}

                {step === 4 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                        Apa Pekerjaan Anda?
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        {jobs.map((job) => (
                            <button
                            key={job}
                            onClick={() => {
                                setFormData({ ...formData, job });
                                nextStep();
                            }}
                            className="flex justify-start mt-4 px-6 py-2 bg-[#b4c8dd] border border-[#17488D] text-[#17488D] font-semibold rounded-xl hover:bg-[#a2b8d0]"
                            >
                            {job}
                            </button>
                        ))}
                    </div>
                    <div className="w-full flex justify-start mt-2">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="mt-4 px-8 py-2 bg-[#17488D] text-[#ffffff] font-normal rounded-xl hover:bg-[#0b2e5e]"
                            >
                            Kembali
                        </button>
                    </div>
                </div>
                )}

                {step === 5 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                        Berapa Usia Anda?
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        {ages.map((age) => (
                            <button
                            key={age}
                            onClick={() => {
                                setFormData({ ...formData, age });
                                nextStep();
                            }}
                            className="flex justify-start mt-4 px-6 py-2 bg-[#b4c8dd] border border-[#17488D] text-[#17488D] font-semibold rounded-xl hover:bg-[#a2b8d0]"
                            >
                            {age}
                            </button>
                        ))}
                    </div>
                    <div className="w-full flex justify-start mt-2">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="mt-4 px-8 py-2 bg-[#17488D] text-[#ffffff] font-normal rounded-xl hover:bg-[#0b2e5e]"
                            >
                            Kembali
                        </button>
                    </div>
                </div>
                )}

                {step === 6 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                        Berapa kisaran penghasilan bulanan Anda?
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        {incomes.map((income) => (
                            <button
                            key={income}
                            onClick={() => {
                                setFormData({ ...formData, income });
                                nextStep();
                            }}
                            className="flex justify-start mt-4 px-6 py-2 bg-[#b4c8dd] border border-[#17488D] text-[#17488D] font-semibold rounded-xl hover:bg-[#a2b8d0]"
                            >
                            {income}
                            </button>
                        ))}
                    </div>
                    <div className="w-full flex justify-start mt-2">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="mt-4 px-8 py-2 bg-[#17488D] text-[#ffffff] font-normal rounded-xl hover:bg-[#0b2e5e]"
                            >
                            Kembali
                        </button>
                    </div>
                </div>
                )}

                {step === 7 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                        Berapa jumlah dana yang ingin Anda investasikan di properti?
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        {funds.map((fund) => (
                            <button
                            key={fund}
                            onClick={() => {
                                setFormData({ ...formData, fund });
                                nextStep();
                            }}
                            className="flex justify-start mt-4 px-6 py-2 bg-[#b4c8dd] border border-[#17488D] text-[#17488D] font-semibold rounded-xl hover:bg-[#a2b8d0]"
                            >
                            {fund}
                            </button>
                        ))}
                    </div>
                    <div className="w-full flex justify-start mt-2">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="mt-4 px-8 py-2 bg-[#17488D] text-[#ffffff] font-normal rounded-xl hover:bg-[#0b2e5e]"
                            >
                            Kembali
                        </button>
                    </div>
                </div>
                )}

                {step === 8 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                        Bagaimana cara Anda berencana membeli properti?
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        {plans.map((plan) => (
                            <button
                            key={plan}
                            onClick={() => {
                                setFormData({ ...formData, plan });
                                nextStep();
                            }}
                            className="flex justify-start mt-4 px-6 py-2 bg-[#b4c8dd] border border-[#17488D] text-[#17488D] font-semibold rounded-xl hover:bg-[#a2b8d0]"
                            >
                            {plan}
                            </button>
                        ))}
                    </div>
                    <div className="w-full flex justify-start mt-2">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="mt-4 px-8 py-2 bg-[#17488D] text-[#ffffff] font-normal rounded-xl hover:bg-[#0b2e5e]"
                            >
                            Kembali
                        </button>
                    </div>
                </div>
                )}

                {step === 9 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                        Jenis properti yang Anda minati?
                    </div>
                    <div className="w-full flex flex-col gap-3">
                    {varieties.map((option) => (
                        <label key={option} className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="variety"
                            value={option}
                            checked={formData.variety.includes(option)}
                            onChange={(e) => {
                            const isChecked = e.target.checked;
                            const value = e.target.value;

                            if (isChecked) {
                                setFormData((prev) => ({
                                ...prev,
                                variety: [...prev.variety, value],
                                }));
                            } else {
                                setFormData((prev) => ({
                                ...prev,
                                variety: prev.variety.filter((v) => v !== value),
                                }));
                            }
                            }}
                            className="w-5 h-5 accent-[#17488D]"
                        />
                        <span className="text-[#17488D] font-semibold">{option}</span>
                        </label>
                    ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                    <div className="w-full text-red-600 text-sm font-semibold mt-2 justify-start flex">{error}</div>
                    )}

                    <div className="w-full flex justify-between">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="mt-6 px-8 py-2 bg-[#17488D] text-white font-normal rounded-xl hover:bg-[#0b2e5e]"
                            >
                            Kembali
                        </button>
                        <button
                            onClick={() => {
                            if (formData.variety.length === 0) {
                                setError("*Pilih setidaknya satu properti sebelum melanjutkan.");
                                return;
                            }
                            setError("");
                            nextStep();
                            }}
                            className="mt-6 px-8 py-2 bg-[#17488D] text-white font-normal rounded-xl hover:bg-[#0b2e5e]"
                        >
                            Lanjut
                        </button>
                    </div>
                </div>
                )}

                {step === 10 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                       Berapa lama Anda berencana menyimpan properti ini?
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        {times.map((time) => (
                            <button
                            key={time}
                            onClick={() => {
                                setFormData({ ...formData, time });
                                nextStep();
                            }}
                            className="flex justify-start mt-4 px-6 py-2 bg-[#b4c8dd] border border-[#17488D] text-[#17488D] font-semibold rounded-xl hover:bg-[#a2b8d0]"
                            >
                            {time}
                            </button>
                        ))}
                    </div>
                    <div className="w-full flex justify-start mt-2">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="mt-4 px-8 py-2 bg-[#17488D] text-[#ffffff] font-normal rounded-xl hover:bg-[#0b2e5e]"
                            >
                            Kembali
                        </button>
                    </div>
                </div>
                )}

                {step === 11 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                        Di mana preferensi lokasi properti yang Anda inginkan?
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        {locations.map((location) => (
                            <button
                            key={location}
                            onClick={() => {
                                setFormData({ ...formData, location });
                                nextStep();
                            }}
                            className="flex justify-start mt-4 px-6 py-2 bg-[#b4c8dd] border border-[#17488D] text-[#17488D] font-semibold rounded-xl hover:bg-[#a2b8d0]"
                            >
                            {location}
                            </button>
                        ))}
                    </div>
                    <div className="w-full flex justify-start mt-2">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="mt-4 px-8 py-2 bg-[#17488D] text-[#ffffff] font-normal rounded-xl hover:bg-[#0b2e5e]"
                            >
                            Kembali
                        </button>
                    </div>
                </div>
                )}

                {step === 12 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                    Fasilitas apa yang paling penting bagi Anda?
                    </div>
                    <div className="w-full flex flex-col gap-3">
                    {facilities.map((option) => (
                        <label key={option} className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="facility"
                            value={option}
                            checked={formData.facility.includes(option)}
                            onChange={(e) => {
                            const isChecked = e.target.checked;
                            const value = e.target.value;

                            if (isChecked) {
                                setFormData((prev) => ({
                                ...prev,
                                facility: [...prev.facility, value],
                                }));
                            } else {
                                setFormData((prev) => ({
                                ...prev,
                                facility: prev.facility.filter((v) => v !== value),
                                }));
                            }
                            }}
                            className="w-5 h-5 accent-[#17488D]"
                        />
                        <span className="text-[#17488D] font-semibold">{option}</span>
                        </label>
                    ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                    <div className="w-full text-red-600 text-sm font-semibold mt-2 justify-start flex">{error}</div>
                    )}

                    <div className="w-full flex justify-between">
                    <button
                        onClick={() => setStep(step - 1)}
                        className="mt-6 px-8 py-2 bg-[#17488D] text-white font-normal rounded-xl hover:bg-[#0b2e5e]"
                        >
                        Kembali
                    </button>
                    <button
                        onClick={() => {
                        if (formData.facility.length === 0) {
                            setError("*Pilih setidaknya satu fasilitas sebelum melanjutkan.");
                            return;
                        }
                        setError("");
                        nextStep();
                        }}
                        className="mt-6 px-8 py-2 bg-[#17488D] text-white font-normal rounded-xl hover:bg-[#0b2e5e]"
                    >
                        Lanjut
                    </button>
                    </div>
                </div>
                )}

                {step === 13 && (
                    <div className="w-full h-full flex justify-center overflow-hidden">
                        <div className="pt-10 px-5 w-full absolute h-[200px] bg-[#b8ccdc] top-[74px] text-[#17488D] font-semibold text-lg xl:text-xl">
                            Berdasarkan jawaban Anda, berikut rekomendasi GeoVest untuk Anda!
                        </div>
                        <div className="relative bg-[#DDEBF3] w-[90%] xl:w-[50%] lg:w-[70%] h-full top-[174px] border-2 border-[#17488D] rounded-xl px-[5%] py-[3%]">
                            {isLoadingUserType ? (
                                <div className="flex pt-40 items-start justify-center h-full text-[#17488D] text-xl">
                                    Menganalisis profil Anda...
                                </div>
                            ) : userTypeData ? (
                                <div>
                                    <div className="flex text-left justify-between items-start gap-6">
                                    {/* Left Column */}
                                    <div className="flex flex-col gap-4 w-[60%]">
                                        <h1 className="text-xl xl:text-2xl font-bold text-[#17488D]">
                                            {userTypeData.title}
                                        </h1>
                                        <p className="text-sm xl:text-lg text-[#17488D]">
                                            {userTypeData.description}
                                        </p>

                                        {/* Ciri-ciri */}
                                        <div>
                                            <h2 className="mt-[30px] font-bold text-[#17488D] mb-1">🙎‍♂️ Ciri-ciri</h2>
                                            <ul className="list-disc list-inside text-[#17488D] text-sm">
                                                <li>Usia: {formData.age}</li>
                                                <li>Penghasilan: {formData.income}</li>
                                                <li>Modal investasi: {formData.fund}</li>
                                                <li>
                                                    Preferensi: {
                                                        formData.variety.length === 1
                                                        ? formData.variety[0]
                                                        : formData.variety.slice(0, -1).join(', ') + ', dan ' + formData.variety.slice(-1)
                                                    }
                                                </li>
                                                <li>Jangka waktu: {formData.time}</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="flex flex-col items-center w-[40%] justify-between">
                                        
                                        {/* Button */}
                                        <Link href="/dashboard">
                                            <button className="bg-[#17488D] hover:bg-[#0b2e5e] text-white text-xs md:text-base lg:text-lg font-semibold px-4 py-2 rounded-xl">
                                                Rekomendasi Properti
                                            </button>
                                        </Link>
                                        
                                        <Piechart properties={piechartProperties}/>
                                    </div>
                                </div>
                            </div>
                            ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-[#17488D] text-xl">
                                    Menganalisis profil Anda...
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}