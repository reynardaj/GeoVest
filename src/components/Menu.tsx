"use client";

import { useState, useEffect } from "react";
import Filters from "./menu/Filters";
import { InfrastructureVisibilityState, SelectedPropertyData, PopupData } from "@/types/map";
import PropertyAnalytics from "./PropertyAnalytics";

interface MenuProps {
  priceRange: [number, number];
  onPriceChange: (values: number[]) => void;
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  selectedInvestmentTypes: string[];
  onInvestmentTypeChange: (type: string) => void;
  heatmapVisible: boolean;
  onToggleHeatmap: () => void;
  infrastructureVisibility: InfrastructureVisibilityState;
  onToggleInfrastructure: (layerId: string) => void;
  selectedReligionBin: string | null;
  onReligionBinChange: (bin: string) => void;
  selectedAgeBin: string | null;
  onAgeBinChange: (bin: string) => void;
  binRanges: { [key: string]: number[] };
  activeTab: string;
  setActiveTab: any;
  income: number[];
  setIncome: (values: number[]) => void;
  selectedPropertyData: SelectedPropertyData | null;
  regionData?: PopupData | null; // Add regionData prop
}

function Menu({
  priceRange,
  onPriceChange,
  selectedCategories,
  onCategoryChange,
  selectedInvestmentTypes,
  onInvestmentTypeChange,
  heatmapVisible,
  onToggleHeatmap,
  infrastructureVisibility,
  onToggleInfrastructure,
  selectedReligionBin,
  onReligionBinChange,
  selectedAgeBin,
  onAgeBinChange,
  binRanges,
  activeTab,
  setActiveTab,
  income,
  setIncome,
  selectedPropertyData,
  regionData, // Added regionData
}: MenuProps) {
  return (
    <div className="shadow-xl rounded-tl-lg  2xl:w-[25%] xl:w-[28%] md:w-[30%] h-screen bg-[#fff] justify-center z-50 overflow-hidden">
      <div className="flex flex-row justify-between text-[#17488D] font-bold 2xl:text-[17px] md:text-[15px] sticky top-0 bg-white z-10">
        <button
          onClick={() => setActiveTab("Filters")}
          className={`relative w-[33.3%] py-4 hover:bg-[#ededed] hover:rounded-tl-lg
                        ${
                          activeTab === "Filters"
                            ? "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-[60%] after:h-[3px] after:bg-[#17488D] after:-translate-x-1/2 after:rounded-t-lg"
                            : "font-medium"
                        }
                    `}
        >
          Filters
        </button>
        <button
          onClick={() => setActiveTab("Analytics")}
          className={`relative w-[33.3%] py-4 hover:bg-[#ededed]
                        ${
                          activeTab === "Analytics"
                            ? "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-[60%] after:h-[3px] after:bg-[#17488D] after:-translate-x-1/2 after:rounded-t-lg"
                            : "font-medium"
                        }
                    `}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("Time Machine")}
          className={`relative w-[33.3%] py-4 hover:bg-[#ededed]
                        ${
                          activeTab === "Time Machine"
                            ? "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-[60%] after:h-[3px] after:bg-[#17488D] after:-translate-x-1/2 after:rounded-t-lg"
                            : "font-medium"
                        }
                    `}
        >
          Time Machine
        </button>
      </div>
      <div
        className="overflow-y-auto flex-1 p-5 pb-[100px] text-black"
        style={{
          maxHeight: "100vh",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {activeTab === "Filters" && (
          <Filters
            priceRange={priceRange}
            onPriceChange={onPriceChange}
            selectedCategories={selectedCategories}
            onCategoryChange={onCategoryChange}
            selectedInvestmentTypes={selectedInvestmentTypes}
            onInvestmentTypeChange={onInvestmentTypeChange}
            heatmapVisible={heatmapVisible}
            onToggleHeatmap={onToggleHeatmap}
            infrastructureVisibility={infrastructureVisibility}
            onToggleInfrastructure={onToggleInfrastructure}
            binRanges={binRanges}
            onReligionBinChange={onReligionBinChange}
            selectedReligionBin={selectedReligionBin}
            onAgeBinChange={onAgeBinChange}
            selectedAgeBin={selectedAgeBin}
            income={income}
            setIncome={setIncome}
          />
        )}
        {activeTab === "Analytics" && (
          <PropertyAnalytics 
            selectedPropertyData={selectedPropertyData} 
            regionData={regionData ? {
              ...regionData,
              regionName: String(regionData.regionName) // Convert to string
            } : null} 
          />
        )}
        {activeTab === "Time Machine" && <TimeMachine selectedPropertyData={selectedPropertyData} />}
      </div>
    </div>
  );
}

interface TimeMachineProps {
  selectedPropertyData: SelectedPropertyData | null;
}

const TimeMachine = ({ selectedPropertyData }: TimeMachineProps) => {
  const yearsOptions = [1, 5, 10, 15, 20];
  const ANNUAL_RATE = 1.67;

  const [initialInvestment, setInitialInvestment] = useState<number | null>(null);
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(1);

  // Update initial investment whenever selectedPropertyData changes
  useEffect(() => {
    console.log("Selected property data:", selectedPropertyData);
    const defaultValue = 0;
    
    if (selectedPropertyData && selectedPropertyData.price) {
      // Handle different price formats
      let priceValue: number;
      
      if (typeof selectedPropertyData.price === 'string') {
        // Remove any non-numeric characters (like currency symbols, commas, etc.)
        const cleanedPrice = selectedPropertyData.price.replace(/[^\d.-]/g, '');
        priceValue = parseFloat(cleanedPrice);
      } else {
        priceValue = selectedPropertyData.price;
      }
      
      console.log("Parsed price value:", priceValue);
      
      if (!isNaN(priceValue) && priceValue > 0) {
        setInitialInvestment(priceValue);
        calculateFutureValue(priceValue, selectedYear);
      } else {
        setInitialInvestment(defaultValue);
        calculateFutureValue(defaultValue, selectedYear);
      }
    } else {
      setInitialInvestment(defaultValue);
      calculateFutureValue(defaultValue, selectedYear);
    }
  }, [selectedPropertyData, selectedYear]);

  const calculateFutureValue = (currentValue: number, years: number) => {
    console.log(`Calculating future value with: ${currentValue} for ${years} years`);
    const futureValue = currentValue * Math.pow(1 + ANNUAL_RATE/100, years);
    setEstimatedValue(Math.round(futureValue));
  };

  const handleYearSelection = (year: number) => {
    setSelectedYear(year);
    if (initialInvestment !== null) {
      calculateFutureValue(initialInvestment, year);
    }
  };

  return (
    <div className="px-3 text-[#17488D]">
      <h2 className="text-xl font-bold">Mesin Waktu</h2>
      <p className="text-black">Jika kamu berinvestasi</p>

      <h3 className="mt-4 text-lg font-bold">Nilai Investasi</h3>
      <p className="text-black">
        {initialInvestment !== null
          ? `Rp ${initialInvestment.toLocaleString("id-ID")}`
          : "Loading..."}
      </p>

      <h3 className="mt-4 text-lg font-bold">
        Mulai Berinvestasi Sejak Berapa Tahun Yang Lalu?
      </h3>
      <div className="flex flex-wrap gap-2 mt-2">
        {yearsOptions.map((year) => (
          <button
            key={year}
            onClick={() => handleYearSelection(year)}
            className={`px-4 py-2 text-[#17488D] font-bold border-[1px] rounded-full border-[#17488D] hover:bg-gray-200
                        ${
                          selectedYear === year
                            ? "outline outline-[3px] outline-[#17488D]"
                            : ""
                        }
                    `}
          >
            {year} Years
          </button>
        ))}
      </div>

      <p className="mt-6 text-black">Nilai Estimasi Investasi Setelah {selectedYear} Tahun</p>
      <h3 className="text-2xl font-bold">
        {estimatedValue !== null
          ? `Rp ${estimatedValue.toLocaleString("id-ID")}`
          : "Loading..."}
      </h3>
    </div>
  );
};

export default Menu;