"use client";

import { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";

function Menu() {
    const [activeTab, setActiveTab] = useState("Analytics");

    return (
        <div className="shadow-xl rounded-tl-lg fixed top-[104px] right-0 2xl:w-[25%] xl:w-[28%] md:w-[30%] h-[100vh] bg-[#fff] justify-center z-50 overflow-hidden">
            <div className="flex flex-row justify-between text-[#17488D] font-bold 2xl:text-[17px] md:text-[15px] sticky top-0 bg-white z-10">
                <button 
                    onClick={() => setActiveTab("Filters")} 
                    className={`relative w-[33.3%] py-4 hover:bg-[#ededed] hover:rounded-tl-lg
                        ${activeTab === "Filters" ? "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-[60%] after:h-[3px] after:bg-[#17488D] after:-translate-x-1/2 after:rounded-t-lg" : "font-medium"}
                    `}
                >
                    Filters
                </button>
                <button 
                    onClick={() => setActiveTab("Analytics")} 
                    className={`relative w-[33.3%] py-4 hover:bg-[#ededed]
                        ${activeTab === "Analytics" ? "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-[60%] after:h-[3px] after:bg-[#17488D] after:-translate-x-1/2 after:rounded-t-lg" : "font-medium"}
                    `}
                >
                    Analytics
                </button>
                <button 
                    onClick={() => setActiveTab("Time Machine")} 
                    className={`relative w-[33.3%] py-4 hover:bg-[#ededed]
                        ${activeTab === "Time Machine" ? "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-[60%] after:h-[3px] after:bg-[#17488D] after:-translate-x-1/2 after:rounded-t-lg" : "font-medium"}
                    `}
                >
                    Time Machine
                </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 pb-[70px] text-black" style={{ maxHeight: "calc(100vh - 136px)", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {activeTab === "Filters" && <Filters />}
                {activeTab === "Analytics" && <div>Analytics Content</div>}
                {activeTab === "Time Machine" && <TimeMachine />}
            </div>
        </div>
    );
}

const TimeMachine = () => {
    const yearsOptions = [1, 5, 10, 15, 20];

    const [initialInvestment, setInitialInvestment] = useState<number | null>(null);
    const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(1);

    useEffect(() => {
        setTimeout(() => {
            setInitialInvestment(3500000000);
        });
        fetchEstimatedInvestment(1);
    }, []);

    const fetchEstimatedInvestment = async (year: number) => {
        try {
            setTimeout(() => {
                const mockData: Record<number, number> = {
                    1: 3700000000,
                    5: 6550000000,
                    10: 9000000000,
                    15: 12000000000,
                    20: 15000000000,
                };
                setEstimatedValue(mockData[year] || null);
            });
        } catch (error) {
            console.error("Error fetching estimated investment:", error);
        }
    };

    const handleYearSelection = (year: number) => {
        setSelectedYear(year);
        fetchEstimatedInvestment(year);
    };

    return (
        <div className="px-3 text-[#17488D]">
            <h2 className="text-xl font-bold">Mesin Waktu</h2>
            <p className="text-black">Jika kamu berinvestasi</p>

            <h3 className="mt-4 text-lg font-bold">Nilai Investasi</h3>
            <p className="text-black">
                {initialInvestment !== null ? `Rp ${initialInvestment.toLocaleString("id-ID")}` : "Loading..."}
            </p>

            <h3 className="mt-4 text-lg font-bold">Mulai Berinvestasi Sejak Berapa Tahun Yang Lalu?</h3>
            <div className="flex flex-wrap gap-2 mt-2">
                {yearsOptions.map((year) => (
                    <button
                    key={year}
                    onClick={() => handleYearSelection(year)}
                    className={`px-4 py-2 text-[#17488D] font-bold border-[1px] rounded-full border-[#17488D] hover:bg-gray-200
                        ${selectedYear === year ? "outline outline-[3px] outline-[#17488D]" : ""}
                    `}
                    >
                    {year} Years
                    </button>
                ))}
            </div>


            <p className="mt-6 text-black">Nilai Estimasi Investasi Hari Ini</p>
            <h3 className="text-2xl font-bold">
                {estimatedValue !== null ? `Rp ${estimatedValue.toLocaleString("id-ID")}` : "Loading..."}
            </h3>
        </div>
    );
};

const Filters = () => {
    const [propertyPrice, setPropertyPrice] = useState([0, 100]);
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
    const [selectedInvestmentTypes, setSelectedInvestmentTypes] = useState<string[]>([]);
    const [selectedReligions, setSelectedReligions] = useState<string | null>(null);
    const [selectedDisaster, setSelectedDisaster] = useState(false);
    const [showDemografi, setShowDemografi] = useState(false);
    const [showDisaster, setShowDisaster] = useState(false);
    const [age, setAge] = useState([10, 100]);
    const [income, setIncome] = useState([5, 100]);

    const propertyTypes = ["Tempat Huni", "Gudang", "Ruko"];
    const investmentTypes = ["Sewa", "Beli"];
    const religions = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Khonghucu"];
    const disasterRisks = ["Banjir"];

    const minPrice = 100_000_000;
    const maxPrice = 100_000_000_000;

    const scalePrice = (value: number) => {
        const minLog = Math.log10(minPrice);
        const maxLog = Math.log10(maxPrice);
        const logRange = minLog + (value / 100) * (maxLog - minLog);
        return Math.pow(10, logRange);
    };

    const formattedPrice = (value: number) => {
        if (value >= 1_000_000_000) {
            return `Rp ${(value / 1_000_000_000).toFixed(0)} M`;
        } else {
            return `Rp ${(value / 1_000_000).toFixed(0)} Juta`;
        }
    };

    const toggleSelection = (item: string, selectedList: string[], setSelectedList: React.Dispatch<React.SetStateAction<string[]>>) => {
        setSelectedList(selectedList.includes(item) ? selectedList.filter(i => i !== item) : [...selectedList, item]);
    };

    return (
        <div className="px-3 text-[#17488D]">
            <h2 className="text-xl font-bold">Filters</h2>

            {/* Harga Properti (Slider) */}
            <h3 className="mt-4 mb-1 text-lg font-bold">Harga Properti</h3>
            <Range
                step={0.1}
                min={0}
                max={100}
                values={propertyPrice}
                onChange={setPropertyPrice}
                renderTrack={({ props, children }) => (
                    <div
                        {...props}
                        className="h-2 w-full rounded bg-gray-200"
                        style={{
                            ...props.style,
                            background: getTrackBackground({
                                values: propertyPrice,
                                colors: ["#ccc", "#17488D", "#ccc"],
                                min: 0,
                                max: 100
                            })
                        }}
                    >
                        {children}
                    </div>
                )}
                renderThumb={({ props }) => {
                    const { key, ...rest } = props;
                    return (
                      <div
                        key={key}
                        {...rest}
                        className="h-5 w-5 bg-[#17488D] rounded-full shadow border-2 border-white"
                      />
                    );
                }}                  
            />
            <div className="flex justify-between text-sm text-gray-600">
                <span>&gt;= {formattedPrice(scalePrice(propertyPrice[0]))}</span>
                <span>&lt;= {formattedPrice(scalePrice(propertyPrice[1]))}</span>
            </div>

            {/* Jenis Properti */}
            <h3 className="mt-4 text-lg font-bold">Jenis Properti</h3>
            {propertyTypes.map(type => {
                const isChecked = selectedPropertyTypes.includes(type);
                return (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                                toggleSelection(type, selectedPropertyTypes, setSelectedPropertyTypes)
                            }
                            className="hidden"
                        />
                        <div
                            className={`w-4 h-4 border-2 rounded ${
                                isChecked ? 'bg-[#17488D] border-[#17488D]' : 'border-gray-400'
                            }`}
                        ></div>
                        <span>{type}</span>
                    </label>
                );
            })}

            {/* Jenis Investasi */}
            <h3 className="mt-4 text-lg font-bold">Jenis Investasi</h3>
            {investmentTypes.map(type => {
                const isChecked = selectedInvestmentTypes.includes(type);
                return (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                                toggleSelection(type, selectedInvestmentTypes, setSelectedInvestmentTypes)
                            }
                            className="hidden" // Hide native checkbox
                        />
                        <div
                            className={`w-4 h-4 border-2 rounded ${
                                isChecked ? 'bg-[#17488D] border-[#17488D]' : 'border-gray-400'
                            }`}
                        ></div>
                        <span>{type}</span>
                    </label>
                );
            })}

            {/* Demografi Dropdown */}
            <h3 className="mt-4 text-lg font-bold cursor-pointer w-fit" onClick={() => setShowDemografi(!showDemografi)}>
                <span className="inline-block w-4 text-center mr-2">
                    {showDemografi ? "▼" : "▶"}
                </span>
                Demografi
            </h3>
            {showDemografi && (
                <div>
                    <h3 className="mt-2 mb-1 text-md font-bold">Umur</h3>
                    <Range
                        step={1}
                        min={10}
                        max={100}
                        values={age}
                        onChange={setAge}
                        renderTrack={({ props, children }) => (
                            <div
                                {...props}
                                className="h-2 w-full rounded bg-gray"
                                style={{
                                    ...props.style,
                                    background: getTrackBackground({
                                        values: age,
                                        colors: ["#ccc", "#17488D", "#ccc"],
                                        min: 10,
                                        max: 100
                                    })
                                }}
                            >
                                {children}
                            </div>
                        )}
                        renderThumb={({ props }) => {
                            const { key, ...rest } = props;
                            return (
                            <div
                                key={key}
                                {...rest}
                                className="h-5 w-5 bg-[#17488D] rounded-full shadow border-2 border-white"
                            />
                            );
                        }}                  
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>&gt;= {age[0]}</span>
                        <span>&lt;= {age[1]}</span>
                    </div>

                    <h3 className="mt-4 mb-1 text-md font-bold">Penghasilan (per bulan)</h3>
                    <Range
                        step={1}
                        min={5}
                        max={100}
                        values={income}
                        onChange={setIncome}
                        renderTrack={({ props, children }) => (
                            <div
                                {...props}
                                className="h-2 w-full rounded bg-gray"
                                style={{
                                    ...props.style,
                                    background: getTrackBackground({
                                        values: income,
                                        colors: ["#ccc", "#17488D", "#ccc"],
                                        min: 5,
                                        max: 100
                                    })
                                }}
                            >
                                {children}
                            </div>
                        )}
                        renderThumb={({ props }) => {
                            const { key, ...rest } = props;
                            return (
                            <div
                                key={key}
                                {...rest}
                                className="h-5 w-5 bg-[#17488D] rounded-full shadow border-2 border-white"
                            />
                            );
                        }}                  
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>&gt;= {income[0]} Juta</span>
                        <span>&lt;= {income[1]} Juta</span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold">Agama</h3>
                    {religions.map(type => {
                        const isChecked = selectedReligions === type;
                        return (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer w-fit">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                        setSelectedReligions(isChecked ? null : type)
                                    }
                                    className="hidden"
                                />
                                <div
                                    className={`w-4 h-4 border-2 rounded ${
                                        isChecked ? 'bg-[#17488D] border-[#17488D]' : 'border-gray-400'
                                    }`}
                                ></div>
                                <span>{type}</span>
                            </label>
                        );
                    })}
                </div>
            )}

            {/* Risiko Bencana Dropdown */}
            <h3 className="mt-4 text-lg font-bold cursor-pointer w-fit" onClick={() => setShowDisaster(!showDisaster)}>
                <span className="inline-block w-4 text-center mr-2">
                    {showDisaster ? "▼" : "▶"}
                </span>
                Risiko Bencana
            </h3>
            {showDisaster && (
                <div>
                    <label className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                            type="checkbox"
                            checked={selectedDisaster}
                            onChange={() => setSelectedDisaster(!selectedDisaster)}
                            className="hidden"
                        />
                        <div
                            className={`w-4 h-4 border-2 rounded ${
                                selectedDisaster ? 'bg-[#17488D] border-[#17488D]' : 'border-gray-400'
                            }`}
                        ></div>
                        <span>Banjir</span>
                    </label>
                </div>
            )}
        </div>
    );
};

const Analytics = () => {
    
};

export default Menu;