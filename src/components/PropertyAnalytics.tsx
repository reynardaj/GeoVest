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
import { SelectedPropertyData, PopupData, MapEventHandlers } from "@/types/map";
import { useState, useEffect } from "react";
import Bars from "@/components/BarChart";
import quarterlyData from "@/../backend/model/combined_forecast.json";

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

const ReligionDistribution: Record<RegionKey, Record<string, number>> = {
  "JAKARTA BARAT": {
    Islam: 1924301,
    Kristen: 266689,
    Katolik: 148645,
    Hindu: 2785,
    Budha: 203850,
    Konghucu: 804,
  },
  "JAKARTA PUSAT": {
    Islam: 943452,
    Kristen: 112608,
    Katolik: 51801,
    Hindu: 3889,
    Budha: 39772,
    Konghucu: 121,
  },
  "JAKARTA SELATAN": {
    Islam: 1931232,
    Kristen: 106944,
    Katolik: 53777,
    Hindu: 3568,
    Budha: 10895,
    Konghucu: 83,
  },
  "JAKARTA TIMUR": {
    Islam: 2831170,
    Kristen: 258426,
    Katolik: 83616,
    Hindu: 5521,
    Budha: 15450,
    Konghucu: 229,
  },
  "JAKARTA UTARA": {
    Islam: 1405482,
    Kristen: 196294,
    Katolik: 91878,
    Hindu: 4288,
    Budha: 127781,
    Konghucu: 321,
  },
};

interface PropertyAnalyticsProps {
  selectedPropertyData: SelectedPropertyData | null;
  regionData?: { regionName: string } | null;
  onRegionBarZoom?: (center: [number, number]) => void;
}

const getFormattedRegionName = (name: string | undefined): RegionKey | "" => {
  if (!name) return "";

  const upperName = name.toUpperCase();

  if (upperName.includes("BARAT")) return "JAKARTA BARAT";
  if (upperName.includes("PUSAT")) return "JAKARTA PUSAT";
  if (upperName.includes("SELATAN")) return "JAKARTA SELATAN";
  if (upperName.includes("TIMUR")) return "JAKARTA TIMUR";
  if (upperName.includes("UTARA")) return "JAKARTA UTARA";

  return "" as "";
};

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

function generatePriceProjection(basePrice: number) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentQuarter = Math.floor(currentMonth / 3) + 1;

  const baseQuarterForCurrentYear = 85 + (currentYear - 2024) * 4;
  const projection = [];

  let projectedPrice = basePrice;

  for (let i = 0; i < 5; i++) {
    const year = currentYear + i;
    const startQuarter = baseQuarterForCurrentYear + i * 4;
    let quartersToUse: number[];

    if (i === 0) {
      const startQuarterOffset = currentQuarter - 1;
      quartersToUse = Array.from(
        { length: 4 - startQuarterOffset },
        (_, idx) => startQuarter + startQuarterOffset + idx
      );
    } else {
      quartersToUse = Array.from({ length: 4 }, (_, idx) => startQuarter + idx);
    }

    const yearlyROIs = quarterlyData
      .filter((d) => quartersToUse.includes(d.Quarter))
      .map((d) => d.Value / 100);

    let meanAnnualROI = 0;
    if (yearlyROIs.length > 0) {
      meanAnnualROI =
        yearlyROIs.reduce((sum, roi) => sum + roi, 0) / yearlyROIs.length;
    } else if (i > 0) {
      meanAnnualROI = projection[i - 1].roi || 0;
    }

    projectedPrice = projectedPrice * (1 + meanAnnualROI);

    projection.push({ year, price: projectedPrice, roi: meanAnnualROI });
  }

  return projection.map(({ year, price }) => ({ year, price }));
}

function generateCumulativeROI(basePrice: number) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentQuarter = Math.floor(currentMonth / 3) + 1;

  const baseQuarterForCurrentYear = 85 + (currentYear - 2024) * 4;
  const projection = [];

  let cumulativeROI = 0;

  for (let i = 0; i < 6; i++) {
    const year = currentYear + i;
    const startQuarter = baseQuarterForCurrentYear + i * 4;
    let quartersToUse: number[];

    if (i === 0) {
      const startQuarterOffset = currentQuarter - 1;
      quartersToUse = Array.from(
        { length: 4 - startQuarterOffset },
        (_, idx) => startQuarter + startQuarterOffset + idx
      );
    } else {
      quartersToUse = Array.from({ length: 4 }, (_, idx) => startQuarter + idx);
    }

    const yearlyROIs = quarterlyData
      .filter((d) => quartersToUse.includes(d.Quarter))
      .map((d) => d.Value / 100);

    let meanAnnualROI = 0;
    if (yearlyROIs.length > 0) {
      meanAnnualROI =
        yearlyROIs.reduce((sum, roi) => sum + roi, 0) / yearlyROIs.length;
    } else if (i > 0) {
      meanAnnualROI = projection[i - 1].roi || 0;
    }

    cumulativeROI = (1 + cumulativeROI) * (1 + meanAnnualROI) - 1;

    projection.push({ year, cumulativeROI, roi: meanAnnualROI });
  }

  return projection.map(({ year, cumulativeROI }) => ({ year, cumulativeROI }));
}

const PropertyAnalytics = ({
  selectedPropertyData,
  regionData,
  onRegionBarZoom,
}: PropertyAnalyticsProps) => {
  const [regionName, setRegionName] = useState<string>("");

  useEffect(() => {
    if (regionData && regionData.regionName) {
      setRegionName(regionData.regionName);
    } else {
      setRegionName("");
    }
  }, [regionData]);

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

  const ageData = getAgeData(regionName);
  const religionData = getReligionData(regionName);

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

  const projectionData = selectedPropertyData
    ? generatePriceProjection(Number(selectedPropertyData.price))
    : [];

  const roiData = selectedPropertyData
    ? generateCumulativeROI(Number(selectedPropertyData.price))
    : [];

  const currentYear = new Date().getFullYear();

  const displayedRoiData = roiData
    .filter((item) => item.year > currentYear)
    .map((item) => {
      const prevYearData = roiData.find((d) => d.year === item.year - 1);
      return {
        year: item.year - 1,
        roi: prevYearData ? prevYearData.cumulativeROI * 100 : 0,
      };
    });

  const renderInsideLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 1.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {(percent * 100).toFixed(1)}%
      </text>
    );
  };

  return (
    <div className="container justify-center">
      <div className="grid gap-10 px-4 py-2 text-black grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] justify-items-center items-start">
        {selectedPropertyData && (
          <>
            <div>
              <h2 className="text-xl font-bold text-center text-[#17488D] mb-8">
                Proyeksi Harga
              </h2>
              <ResponsiveContainer width={270} height={250}>
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
          </>
        )}
        {selectedPropertyData && (
          <>
            <div>
              <h2 className="text-xl font-bold text-center text-[#17488D] mb-8">
                {/* ROI Pasar di {regionName || "Jakarta"} */}
                Compounding ROI di Jakarta
              </h2>
              <ResponsiveContainer width={270} height={250}>
                <BarChart data={displayedRoiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    domain={[0, "auto"]}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(2)}%`,
                      "ROI",
                    ]}
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

        <div className="w-full flex justify-center">
          <Bars regionName={regionName} onRegionBarZoom={onRegionBarZoom} />
        </div>

        {/* Demographic information section - only show when a region is actually selected */}
        {hasDemographicData && regionData?.regionName && (
          <div>
            {ageData.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-center text-[#17488D] mb-8">
                  Distribusi Umur {regionName || "Jakarta"} (2024)
                </h3>
                <div className="h-[400px] w-full">
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
                        label={renderInsideLabel}
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
                          const percent = (
                            (Number(value) / total) *
                            100
                          ).toFixed(1);
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
                          fontWeight: 500,
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
        {hasDemographicData && regionData?.regionName && (
          <div>
            {religionData.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-center text-[#17488D] mb-8">
                  Distribusi Agama {regionName || "Jakarta"} (2024)
                </h3>
                <div className="h-[350px] w-full">
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
                        label={renderInsideLabel}
                      >
                        {religionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS_RELIGION[index % COLORS_RELIGION.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          const total = religionData.reduce(
                            (sum, entry) => sum + entry.value,
                            0
                          );
                          const percent = (
                            (Number(value) / total) *
                            100
                          ).toFixed(1);
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
                          fontWeight: 500,
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
    </div>
  );
};

export default PropertyAnalytics;
