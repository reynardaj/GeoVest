import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { SelectedPropertyData, PopupData } from "@/types/map";
import { useState, useEffect } from "react";
import { Bold } from "lucide-react";

type AgeGroup = {
  "Balita (0-5 tahun)": number;
  "Anak-anak (6-15 tahun)": number;
  "Remaja (16-20 tahun)": number;
  "Dewasa Muda (21-30 tahun)": number;
  "Dewasa (31-40 tahun)": number;
  "Dewasa Akhir (41-60 tahun)": number;
  "Lansia (>60 tahun)": number;
};

type ReligionGroup = {
  ISLAM: number;
  KRISTEN: number;
  KATHOLIK: number;
  HINDU: number;
  BUDHA: number;
  KONGHUCU: number;
};

type RegionKey =
  | "JAKARTA BARAT"
  | "JAKARTA PUSAT"
  | "JAKARTA SELATAN"
  | "JAKARTA TIMUR"
  | "JAKARTA UTARA";

const AgeDistribution: Record<RegionKey, AgeGroup> = {
  "JAKARTA BARAT": {
    "Balita (0-5 tahun)": 405483,
    "Anak-anak (6-15 tahun)": 393384,
    "Remaja (16-20 tahun)": 187136,
    "Dewasa Muda (21-30 tahun)": 414529,
    "Dewasa (31-40 tahun)": 470076,
    "Dewasa Akhir (41-60 tahun)": 551059,
    "Lansia (>60 tahun)": 125440,
  },
  "JAKARTA PUSAT": {
    "Balita (0-5 tahun)": 171712,
    "Anak-anak (6-15 tahun)": 183870,
    "Remaja (16-20 tahun)": 85710,
    "Dewasa Muda (21-30 tahun)": 174320,
    "Dewasa (31-40 tahun)": 192570,
    "Dewasa Akhir (41-60 tahun)": 271433,
    "Lansia (>60 tahun)": 72072,
  },
  "JAKARTA SELATAN": {
    "Balita (0-5 tahun)": 326341,
    "Anak-anak (6-15 tahun)": 333832,
    "Remaja (16-20 tahun)": 158120,
    "Dewasa Muda (21-30 tahun)": 323202,
    "Dewasa (31-40 tahun)": 376605,
    "Dewasa Akhir (41-60 tahun)": 481876,
    "Lansia (>60 tahun)": 106575,
  },
  "JAKARTA TIMUR": {
    "Balita (0-5 tahun)": 514820,
    "Anak-anak (6-15 tahun)": 504249,
    "Remaja (16-20 tahun)": 242879,
    "Dewasa Muda (21-30 tahun)": 508840,
    "Dewasa (31-40 tahun)": 570090,
    "Dewasa Akhir (41-60 tahun)": 703681,
    "Lansia (>60 tahun)": 149974,
  },
  "JAKARTA UTARA": {
    "Balita (0-5 tahun)": 304372,
    "Anak-anak (6-15 tahun)": 281974,
    "Remaja (16-20 tahun)": 135190,
    "Dewasa Muda (21-30 tahun)": 298445,
    "Dewasa (31-40 tahun)": 336978,
    "Dewasa Akhir (41-60 tahun)": 381557,
    "Lansia (>60 tahun)": 87534,
  },
};

const ReligionDistribution: Record<RegionKey, ReligionGroup> = {
  "JAKARTA BARAT": {
    ISLAM: 1924301,
    KRISTEN: 266689,
    KATHOLIK: 148645,
    HINDU: 2785,
    BUDHA: 203850,
    KONGHUCU: 804,
  },
  "JAKARTA PUSAT": {
    ISLAM: 943452,
    KRISTEN: 112608,
    KATHOLIK: 51801,
    HINDU: 3889,
    BUDHA: 39772,
    KONGHUCU: 121,
  },
  "JAKARTA SELATAN": {
    ISLAM: 1931232,
    KRISTEN: 106944,
    KATHOLIK: 53777,
    HINDU: 3568,
    BUDHA: 10895,
    KONGHUCU: 83,
  },
  "JAKARTA TIMUR": {
    ISLAM: 2831170,
    KRISTEN: 258426,
    KATHOLIK: 83616,
    HINDU: 5521,
    BUDHA: 15450,
    KONGHUCU: 229,
  },
  "JAKARTA UTARA": {
    ISLAM: 1405482,
    KRISTEN: 196294,
    KATHOLIK: 91878,
    HINDU: 4288,
    BUDHA: 127781,
    KONGHUCU: 321,
  },
};

interface PropertyAnalyticsProps {
  selectedPropertyData: SelectedPropertyData | null;
  regionData?: { regionName: string } | null;
}

const randomNormal = (mean: number, stdDev: number): number => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // avoid 0
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
};

// Get region-specific growth rates for ROI calculation
const getROIForArea = (area: string): number => {
  const roiRates: { [key: string]: number } = {
    "Jakarta Barat": 1.42,
    "Jakarta Pusat": 2.03,
    "Jakarta Timur": 1.76,
    "Jakarta Utara": 1.55,
    "Jakarta Selatan": 1.86,
  };
  return roiRates[area] || 1.67; // Default ROI rate
};

const generatePriceProjection = (currentPrice: number, regionName: string) => {
  const projection = [];
  let price = currentPrice;
  const baseGrowthRate = getROIForArea(regionName) / 100; // Use region-based growth rate

  for (let i = 0; i <= 5; i++) {
    const growthRate = randomNormal(baseGrowthRate, 0.6 / 100); // Add randomness with a standard deviation of 1.2%
    price += price * growthRate; // Apply growth
    projection.push({
      year: new Date().getFullYear() + i,
      price: parseFloat(price.toFixed(2)),
    });
  }

  return projection;
};

// Generate completely independent ROI data based on different market trends
const generateIndependentROIData = (
  initialPrice: number,
  regionName: string
) => {
  const roiData = [];
  const baseMarketTrend = getROIForArea(regionName) / 100; // Different base rate for market trends
  let accumulatedValue = initialPrice;

  for (let i = 0; i <= 5; i++) {
    // Use completely separate random factors for market-driven ROI
    const marketFactor = randomNormal(baseMarketTrend, 0.6 / 100); // Higher volatility for market trends

    // Only apply market factor after first year
    if (i > 0) {
      // Different growth pattern that can be more volatile than price projection
      accumulatedValue = accumulatedValue * (1 + marketFactor);
    }

    // Calculate ROI based on accumulated value vs initial price
    const roi = ((accumulatedValue - initialPrice) / initialPrice) * 100;
    roiData.push({
      year: new Date().getFullYear() + i,
      roi: parseFloat(roi.toFixed(2)),
      trend: i > 0 ? parseFloat((marketFactor * 100).toFixed(2)) : 0, // Store the yearly trend
    });
  }
  return roiData;
};

// Function to get formatted region name that matches the keys in our distribution objects
const getFormattedRegionName = (name: string | undefined): RegionKey | "" => {
  if (!name) return "";

  // Convert to uppercase for case-insensitive matching
  const upperName = name.toUpperCase();

  // Check for specific patterns in the region name
  if (upperName.includes("BARAT")) return "JAKARTA BARAT";
  if (upperName.includes("PUSAT")) return "JAKARTA PUSAT";
  if (upperName.includes("SELATAN")) return "JAKARTA SELATAN";
  if (upperName.includes("TIMUR")) return "JAKARTA TIMUR";
  if (upperName.includes("UTARA")) return "JAKARTA UTARA";

  return "" as "";
};

// Prepare data for pie charts
const getAgeData = (region: string) => {
  const formattedRegion = getFormattedRegionName(region);
  if (!formattedRegion || !AgeDistribution[formattedRegion]) return [];

  return Object.entries(AgeDistribution[formattedRegion]).map(
    ([name, value]) => ({
      name,
      value,
    })
  );
};

const getReligionData = (region: string) => {
  const formattedRegion = getFormattedRegionName(region);
  if (!formattedRegion || !ReligionDistribution[formattedRegion]) return [];

  return Object.entries(ReligionDistribution[formattedRegion]).map(
    ([name, value]) => ({
      name,
      value,
    })
  );
};

const PropertyAnalytics = ({
  selectedPropertyData,
  regionData,
}: PropertyAnalyticsProps) => {
  const [regionName, setRegionName] = useState<string>("");

  // Update region name when regionData changes
  useEffect(() => {
    if (regionData && regionData.regionName) {
      setRegionName(regionData.regionName);
    } else {
      // Reset region name when no region is selected
      setRegionName("");
    }
  }, [regionData]);

  // Colors for pie charts
  const COLORS_AGE = [
    "#97E6DC",
    "#76D7C4",
    "#4CB8C4",
    "#2F6F8F",
    "#2F4A6F",
    "#17488D",
    "#0F2C4D",
  ];
  const COLORS_RELIGION = [
    "#97E6DC",
    "#4CB8C4",
    "#2F6F8F",
    "#2F4A6F",
    "#17488D",
    "#0F2C4D",
  ];

  // Get data for pie charts based on region name
  const ageData = getAgeData(regionName);
  const religionData = getReligionData(regionName);

  // Check if we have demographic data for this region AND if a region is actually selected
  const hasDemographicData =
    (ageData.length > 0 || religionData.length > 0) && regionData?.regionName;

  if (!selectedPropertyData && !hasDemographicData) {
    return (
      <div className="px-4 py-8 text-center">
        <h2 className="text-xl font-bold text-[#17488D] mb-4">
          Proyeksi Properti
        </h2>
        <p className="text-gray-600">
          Pilih properti atau wilayah pada peta untuk melihat analitik.
        </p>
      </div>
    );
  }

  // Only generate projection data if we have property data
  const projectionData = selectedPropertyData
    ? generatePriceProjection(Number(selectedPropertyData.price), regionName)
    : [];

  // Only generate ROI data if we have property data
  const roiData = selectedPropertyData
    ? generateIndependentROIData(Number(selectedPropertyData.price), regionName)
    : [];

  const displayedRoiData = roiData.filter(
    (item) => item.year > new Date().getFullYear()
  );

  return (
    <div className="text-black space-y-6 px-4 py-2">
      {selectedPropertyData && (
        <>
          {/* <div>
            <h2 className="text-xl font-bold text-[#17488D]">Detail Properti</h2>
            <h3 className="text-lg font-semibold mt-3">{selectedPropertyData.propertyName}</h3>

            <div className="mt-4 space-y-2 text-sm">
              <p><span className="font-semibold">Kategori:</span> {selectedPropertyData.category}</p>
              <p><span className="font-semibold">Status:</span> {selectedPropertyData.status}</p>
              <p><span className="font-semibold">Harga:</span> Rp {selectedPropertyData.price?.toLocaleString('id-ID') ?? 'N/A'}</p>
              <p><span className="font-semibold">Luas Bangunan:</span> {selectedPropertyData.buildingArea?.toLocaleString('id-ID') ?? 'N/A'} {selectedPropertyData.buildingArea !== 'N/A' && 'm²'}</p>
              <p><span className="font-semibold">Luas Tanah:</span> {selectedPropertyData.landArea?.toLocaleString('id-ID') ?? 'N/A'} {selectedPropertyData.landArea !== 'N/A' && 'm²'}</p>
              <p><span className="font-semibold">Sertifikat:</span> {selectedPropertyData.certificateType}</p>
            </div>
          </div> */}

          <div>
            <h2 className="text-xl font-bold text-[#17488D] pb-3">
              Proyeksi Harga
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                  tickFormatter={(value) =>
                    `${(value / 1_000_000).toFixed(0)} jt`
                  }
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(value) => [
                    `Rp ${value.toLocaleString("id-ID")}`,
                    "Harga Proyeksi",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#17488D"
                  name="Harga Proyeksi"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#17488D] pb-3">
              ROI Pasar di {regionName || "Jakarta"}
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={displayedRoiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, "ROI"]}
                />
                <Bar
                  dataKey="roi"
                  fill="#17488D"
                  name="ROI"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Demographic information section - only show when a region is actually selected */}
      {hasDemographicData && regionData?.regionName && (
        <div>
          {ageData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#17488D] mb-8">
                Distribusi Umur {regionName || "Jakarta"}
              </h3>
              <div className="h-[400px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#17488D"
                      dataKey="value"
                    >
                      {ageData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS_AGE[index % COLORS_AGE.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const total = ageData.reduce(
                          (sum, entry) => sum + entry.value,
                          0
                        );
                        const percent = ((Number(value) / total) * 100).toFixed(
                          1
                        );
                        return [
                          `${Number(value).toLocaleString(
                            "id-ID"
                          )} (${percent}%)`,
                          name,
                        ];
                      }}
                      itemStyle={{
                        color: "#17488D",
                      }}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{
                        paddingTop: 20,
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                      iconSize={10}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {religionData.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-[#17488D] mb-2">
                Distribusi Agama {regionName || "Jakarta"}
              </h3>
              <div className="h-[350px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={religionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#17488D"
                      dataKey="value"
                    >
                      {religionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS_RELIGION[index % COLORS_RELIGION.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const total = religionData.reduce(
                          (sum, entry) => sum + entry.value,
                          0
                        );
                        const percent = ((Number(value) / total) * 100).toFixed(
                          1
                        );
                        return [
                          `${Number(value).toLocaleString(
                            "id-ID"
                          )} (${percent}%)`,
                          name,
                        ];
                      }}
                      itemStyle={{
                        color: "#17488D",
                      }}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{
                        paddingTop: 20,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                      iconSize={10}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyAnalytics;
