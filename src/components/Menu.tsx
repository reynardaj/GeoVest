"use client";

import { useState, useEffect } from "react";
import Filters from "./menu/Filters";
import {
  InfrastructureVisibilityState,
  SelectedPropertyData,
  PopupData,
} from "@/types/map";
import PropertyAnalytics from "./PropertyAnalytics";

import quarterlyData from "@/../backend/model/combined_forecast.json";
import ROICalculator from "./roi-calculator";

interface MenuProps {
  priceRange: [number, number];
  onPriceChange: (values: number[]) => void;
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  selectedInvestmentTypes: string[];
  onInvestmentTypeChange: (type: string) => void;
  floodVisible: boolean;
  onToggleFlood: () => void;
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
  regionData?: PopupData | null;
  onRegionBarZoom?: (center: [number, number]) => void;
  ageOpacity: number;
  onAgeOpacityChange: (opacity: number) => void;
  religionOpacity: number;
  onReligionOpacityChange: (opacity: number) => void;
}

function Menu({
  priceRange,
  onPriceChange,
  selectedCategories,
  onCategoryChange,
  selectedInvestmentTypes,
  onInvestmentTypeChange,
  floodVisible,
  onToggleFlood,
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
  regionData,
  onRegionBarZoom,
  religionOpacity,
  onReligionOpacityChange,
  ageOpacity,
  onAgeOpacityChange,
}: MenuProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className={`bg-[#fff] justify-center z-50 overflow-hidden h-full ${!isMobile ? 'shadow-xl rounded-tl-lg' : ''}`}>
      <div className="ml-[5px] flex flex-row justify-between text-[#17488D] font-bold 2xl:text-[17px] md:text-[15px] sticky top-0 bg-white z-10">
        <button
          onClick={() => setActiveTab("Filters")}
          className={`relative w-[25%] py-4 hover:bg-[#ededed] hover:rounded-tl-lg
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
          className={`relative w-[25%] py-4 hover:bg-[#ededed]
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
          className={`relative w-[25%] py-4 hover:bg-[#ededed]
                        ${
                          activeTab === "Time Machine"
                            ? "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-[60%] after:h-[3px] after:bg-[#17488D] after:-translate-x-1/2 after:rounded-t-lg"
                            : "font-medium"
                        }
                    `}
        >
          Time Machine
        </button>
        <button
          onClick={() => setActiveTab("ROI Calculator")}
          className={`relative w-[25%] py-4 hover:bg-[#ededed]
                        ${
                          activeTab === "ROI Calculator"
                            ? "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-[60%] after:h-[3px] after:bg-[#17488D] after:-translate-x-1/2 after:rounded-t-lg"
                            : "font-medium"
                        }
                    `}
        >
          Investment Calculator
        </button>
      </div>
      <div
        className="overflow-y-auto flex-1 p-5 pb-[100px] text-black"
        style={{
          maxHeight: isMobile ? "calc(100vh - 56px)" : "100vh",
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
            floodVisible={floodVisible}
            onToggleFlood={onToggleFlood}
            infrastructureVisibility={infrastructureVisibility}
            onToggleInfrastructure={onToggleInfrastructure}
            binRanges={binRanges}
            onReligionBinChange={onReligionBinChange}
            selectedReligionBin={selectedReligionBin}
            onAgeBinChange={onAgeBinChange}
            selectedAgeBin={selectedAgeBin}
            income={income}
            setIncome={setIncome}
            selectedPropertyData={selectedPropertyData}
            regionData={regionData}
            onRegionBarZoom={onRegionBarZoom}
            religionOpacity={religionOpacity}
            onReligionOpacityChange={onReligionOpacityChange}
            ageOpacity={ageOpacity}
            onAgeOpacityChange={onAgeOpacityChange}
          />
        )}
        {activeTab === "Analytics" && (
          <PropertyAnalytics
            selectedPropertyData={selectedPropertyData}
            regionData={
              regionData
                ? {
                    ...regionData,
                    regionName: String(regionData.regionName), // Convert to string
                  }
                : null
            }
            onRegionBarZoom={onRegionBarZoom}
          />
        )}

        {activeTab === "Time Machine" && (
          <TimeMachine selectedPropertyData={selectedPropertyData} />
        )}
        {activeTab === "ROI Calculator" && <ROICalculator />}
      </div>
    </div>
  );
}

interface TimeMachineProps {
  selectedPropertyData: SelectedPropertyData | null;
}

const TimeMachine = ({ selectedPropertyData }: TimeMachineProps) => {
  const yearsOptions = [1, 5, 10, 15, 20];

  const [initialInvestment, setInitialInvestment] = useState<number | null>(
    null
  );
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(1);

  const calculateFutureValue = (initial: number, years: number) => {
    if (!initial || initial <= 0) {
      setEstimatedValue(null);
      return;
    }

    const baseQuarter = 88;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentQuarterInYear = Math.floor(currentMonth / 3) + 1;

    const yearDiff = currentYear - 2025;

    const startQuarterNumber = baseQuarter + yearDiff * 4 + (currentQuarterInYear);

    let projectedPrice = initial;

    for (let year = 0; year < years; year++) {
      const firstQuarterOfYear = startQuarterNumber + year * 4;

      const quartersThisYear = [
        firstQuarterOfYear,
        firstQuarterOfYear + 1,
        firstQuarterOfYear + 2,
        firstQuarterOfYear + 3,
      ];

      const rois = quartersThisYear.map((qNum) => {
        const roiEntry = quarterlyData.find((d) => d.Quarter === qNum);
        return roiEntry ? roiEntry.Value / 100 : 0;
      });

      const meanROI =
        rois.reduce((sum, val) => sum + val, 0) / rois.length || 0;
      
      console.log(`Year ${year + 1}: Quarters ${quartersThisYear.join(", ")}, Mean ROI: ${meanROI}`);

      projectedPrice = projectedPrice * (1 + meanROI);
    }

    setEstimatedValue(Math.round(projectedPrice));
  };

  useEffect(() => {
    if (selectedPropertyData && selectedPropertyData.price) {
      let priceNum: number;

      if (typeof selectedPropertyData.price === "string") {
        const cleaned = selectedPropertyData.price.replace(/[^\d.-]/g, "");
        priceNum = parseFloat(cleaned);

      } else {
        priceNum = selectedPropertyData.price;
      }

      if (!isNaN(priceNum) && priceNum > 0) {
        setInitialInvestment(priceNum);
        calculateFutureValue(priceNum, selectedYear);
      } else {
        setInitialInvestment(0);
        setEstimatedValue(0);
      }
    } else {
      setInitialInvestment(0);
      setEstimatedValue(0);
    }
  }, [selectedPropertyData, selectedYear]);


  const handleYearSelection = (year: number) => {
    setSelectedYear(year);
    if (initialInvestment !== null) {
      calculateFutureValue(initialInvestment, year);
    }
  };

  if (!selectedPropertyData) {
    return (
      <div className="px-4 py-8 text-center">
        <h2 className="text-xl font-bold text-[#17488D] mb-4">Mesin Waktu</h2>
        <p className="text-gray-600">
          Pilih properti pada peta untuk melihat estimasi investasi.
        </p>
      </div>
    );
  }

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

      <p className="mt-6 text-black">
        Nilai Estimasi Investasi Setelah {selectedYear} Tahun
      </p>
      <h3 className="text-2xl font-bold">
        {estimatedValue !== null
          ? `Rp ${estimatedValue.toLocaleString("id-ID")}`
          : "Loading..."}
      </h3>
    </div>
  );
};

export default Menu;
