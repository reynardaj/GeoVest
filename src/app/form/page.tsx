'use client';

import { useState, useEffect } from "react";
import PiechartForm from '../../components/PiechartForm'
import Link from 'next/link';

export default function form() {
    const [dataSaved, setDataSaved] = useState(false);
    const [step, setStep] = useState(1);
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

    useEffect(() => {
        if (step === 13) {
            saveFormDataToLocalStorage(formData);
            setDataSaved(true);
        }
    }, [step, formData]);

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
        "Residensial", "Komersial", "Properti Campuran"
    ]

    const times = [
        "< 1 Tahun", "1-3 Tahun", "3-5 Tahun", "> 5 Tahun", "Belum Menentukan"
    ]

    const locations = [
        "Jakarta Barat", "Jakarta Utara", "Jakarta Selatan", "Jakarta Timur", "Jakarta Pusat"
    ]

    const facilities = [
        "Rumah Sakit", "Transportasi Umum"
    ]

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
        
        // If this is the step before the final step (step 12 -> 13), save form data
        if (step === 12) {
          saveFormDataToLocalStorage(formData);
        }
        
        setError("");
        setStep(step + 1);
    };

    const saveFormDataToLocalStorage = (data: any): void => {
        localStorage.setItem('formData', JSON.stringify(data));
    };

    const [error, setError] = useState("");

    return (
        <div
            className="relative h-screen w-full flex items-center justify-center"
            style={{
                backgroundImage: `linear-gradient(to bottom left, #17488D 5%,rgb(103, 137, 185) 20%, #ddebf3 60%,rgb(210, 231, 220) 80%, #91E0B5 95%)`
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

                            <button
                            onClick={() => window.location.href = "/dashboard"}
                            className="w-full border-2 border-[#17488D] text-[#17488D] hover:bg-[#17488D] hover:text-white font-semibold py-2 rounded-xl"
                            >
                            Saya sudah tau yang saya inginkan
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
                        placeholder="Ketik disini..."
                        className="w-full p-3 rounded-xl bg-[#b4c8dd] border border-[#17488D] text-[#17488D] font-semibold placeholder:text-[#17488D] "
                    />
                    {error && (
                        <div className="text-red-600 text-sm font-semibold mt-2 text-left w-full">
                            {error}
                        </div>
                    )}
                    <div className="w-full flex justify-end">
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

                    <div className="w-full flex justify-end">
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
                </div>
                )}

                {step === 11 && (
                <div className="flex flex-col justify-center items-center h-full w-auto max-w-[600px] p-4 mx-auto">
                    <div className="w-full text-left flex justify-start text-[35px] font-bold mb-4 text-blue-900">
                        Di mana lokasi properti yang Anda inginkan?
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

                    <div className="w-full flex justify-end">
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
                    <div className="pt-10 w-full absolute h-[200px] bg-[#b8ccdc] top-[74px] text-[#17488D] font-semibold text-xl">
                        Berdasarkan jawaban Anda, berikut rekomendasi GeoVest untuk Anda!
                    </div>
                    <div className="relative bg-[#DDEBF3] w-[50%] h-full top-[174px] border-2 border-[#17488D] rounded-xl px-[5%] py-[3%]">
                        <div className="flex text-left justify-between items-start gap-6">
                            {/* Left Column */}
                            <div className="flex flex-col gap-4 w-[60%]">
                                <h1 className="text-2xl font-bold text-[#17488D]">
                                    {/* "18-24", "25-34", "35-44", "45-54", "55+" */}
                                    {/* "< 1 Juta", "1-5 Juta", "5-10 Juta", "10-50 Juta", "50-100 Juta", "100+ Juta" */}
                                    {/* "< 100 Juta", "100-500 Juta", "500 Juta-1 M", "1-5 M", "> 5 M"? */}
                                    {(formData.age === "18-24" || formData.age === "25-34" || formData.income === "< 1 Juta") && (formData.fund === "< 100 Juta" || formData.fund === "100-500 Juta") ? (
                                        <>The Young Investor 🔥</>
                                    ) : null}
                                    {(formData.fund === "500 Juta-1 M" || formData.fund === "1-5 M") ? (
                                        <>The Long-Term Planner 📈</>
                                    ) : null}
                                    {(formData.fund === "> 5 M") ? (
                                        <>The Commercial Investor 🏢</>
                                    ) : null}
                                </h1>
                                <p className="text-[#17488D]">
                                    {(formData.age === "18-24" || formData.age === "25-34" || formData.income === "< 1 Juta") && (formData.fund === "< 100 Juta" || formData.fund === "100-500 Juta") ? (
                                        <>Kamu baru mulai berinvestasi dan ingin mendapatkan properti dengan modal terjangkau serta pertumbuhan nilai yang cepat. Properti kecil seperti apartemen di lokasi strategis bisa menjadi pilihan terbaik untukmu!</>
                                    ) : null}
                                    {(formData.fund === "500 Juta-1 M" || formData.fund === "1-5 M") ? (
                                        <>Kamu sudah berada di tahap stabil dalam hidup dan ingin memastikan masa depan yang aman. Fokusmu adalah investasi jangka panjang dengan nilai yang terus naik seiring waktu. Properti rumah tapak di area yang berkembang menjadi pilihan ideal karena cocok untuk tempat tinggal sekaligus aset yang bisa diwariskan.</>
                                    ) : null}
                                    {(formData.fund === "> 5 M") ? (
                                        <>Kamu adalah investor berpengalaman atau pelaku bisnis yang ingin mengembangkan aset di sektor properti komersial. Fokusmu adalah cashflow yang stabil dan potensi bisnis jangka menengah. Properti seperti ruko, gudang, atau kantor di lokasi strategis dengan tingkat sewa tinggi menjadi target utama investasimu.</>
                                    ) : null}
                                </p>

                                {/* Ciri-ciri */}
                                <div>
                                    <h2 className="mt-[30px] font-bold text-[#17488D] mb-1">🙎‍♂️ Ciri-ciri</h2>
                                    <ul className="list-disc list-inside text-[#17488D] text-sm">
                                    <li>Usia: {formData.age}</li>
                                    <li>Penghasilan: {formData.income}</li>
                                    <li>Modal investasi: {formData.fund}</li>
                                    <li>Preferensi: {formData.variety.join(', ')}</li>
                                    <li>Jangka waktu: {formData.time}</li>
                                    </ul>
                                </div>

                                {/* Strategi Investasi */}
                                <div>
                                    <h2 className="mt-[30px] font-bold text-[#17488D] mb-1">📌 Strategi Investasi</h2>
                                    <ul className="list-disc list-inside text-[#17488D] text-sm">
                                    <li>
                                        {(formData.age === "18-24" || formData.age === "25-34" || formData.income === "< 1 Juta") && (formData.fund === "< 100 Juta" || formData.fund === "100-500 Juta") ? (
                                            <>Properti kecil dengan harga terjangkau & kenaikan nilai cepat.</>
                                        ) : null}
                                        {(formData.fund === "500 Juta-1 M" || formData.fund === "1-5 M") ? (
                                            <>Rumah di area berkembang dengan potensi nilai naik.</>
                                        ) : null}
                                        {(formData.fund === "> 5 M") ? (
                                            <>Ruko, gudang, atau kantor di area bisnis berkembang.</>
                                        ) : null}
                                    </li>
                                    <li>
                                        {(formData.age === "18-24" || formData.age === "25-34" || formData.income === "< 1 Juta") && (formData.fund === "< 100 Juta" || formData.fund === "100-500 Juta") ? (
                                            <>Apartemen dekat transportasi & area bisnis.</>
                                        ) : null}
                                        {(formData.fund === "500 Juta-1 M" || formData.fund === "1-5 M") ? (
                                            <>Dekat sekolah, rumah sakit, dan transportasi.</>
                                        ) : null}
                                        {(formData.fund === "> 5 M") ? (
                                            <>Properti sewa tinggi dengan cashflow stabil.</>
                                        ) : null}
                                    </li>
                                    </ul>
                                </div>

                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col items-center w-[40%] justify-between gap-4">
                                {/* Button */}
                                <Link href="/dashboard">
                                    <button className="bg-[#17488D] hover:bg-[#0b2e5e] text-white font-semibold px-4 py-2 rounded-xl">
                                        Lihat Rekomendasi Properti
                                    </button>
                                </Link>

                                <PiechartForm/>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}