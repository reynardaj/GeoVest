import React from "react";
import type { MapEventHandlers } from "@/types/map";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ROIData {
  region: string;
  location: string;
  roi: number;
  coordinates: [number, number];
}

const ROIData = [
  { region: "Jakarta Timur", location: "Cakung", roi: 1.79, coordinates: [106.947666, -6.185562] },
  { region: "Jakarta Timur", location: "Duren Sawit", roi: 1.66, coordinates: [106.914199, -6.2317] },
  { region: "Jakarta Timur", location: "Jatinegara", roi: 1.82, coordinates: [106.87746273428313, -6.227442952783598] },
  { region: "Jakarta Timur", location: "Kramat Jati", roi: 1.99, coordinates: [106.8702, -6.2705] },
  { region: "Jakarta Timur", location: "Makasar", roi: 1.64, coordinates: [106.908, -6.2663] },
  { region: "Jakarta Timur", location: "Matraman", roi: 1.64, coordinates: [106.8602, -6.2104] },
  { region: "Jakarta Timur", location: "Pulogadung", roi: 2.01, coordinates: [106.9079, -6.1872] },
  { region: "Jakarta Timur", location: "Pasar Rebo", roi: 1.84, coordinates: [106.8477, -6.3237] },
  { region: "Jakarta Timur", location: "Bukit Duri", roi: 1.6, coordinates: [106.8566, -6.2385] },
  { region: "Jakarta Timur", location: "Ciracas", roi: 1.8, coordinates: [106.8793, -6.3131] },

  { region: "Jakarta Selatan", location: "Cilandak", roi: 1.6, coordinates: [106.79328946600738, -6.293182703631038] },
  { region: "Jakarta Selatan", location: "Jagakarsa", roi: 1.6, coordinates: [106.82272343347491, -6.334189582024369] },
  { region: "Jakarta Selatan", location: "Kebayoran Baru", roi: 1.74, coordinates: [106.80148105381707, -6.244734043007957] },
  { region: "Jakarta Selatan", location: "Kebayoran Lama", roi: 1.31, coordinates: [106.78016428559654, -6.250060752501468] },
  { region: "Jakarta Selatan", location: "Mampang Prapatan", roi: 1.35, coordinates: [106.82100878226972, -6.252215621730367] },
  { region: "Jakarta Selatan", location: "Pancoran", roi: 1.58, coordinates: [106.84383093111531, -6.255435964233159] },
  { region: "Jakarta Selatan", location: "Pasar Minggu", roi: 1.49, coordinates: [106.8293487268849, -6.290718899015726] },
  { region: "Jakarta Selatan", location: "Tebet", roi: 1.75, coordinates: [106.85088774903421, -6.228772946318337] },
  { region: "Jakarta Selatan", location: "Setiabudi", roi: 1.51, coordinates: [106.8299268556183, -6.21961493661333] },
  { region: "Jakarta Selatan", location: "Pesanggrahan", roi: 1.41, coordinates: [106.7507, -6.2784] },

  { region: "Jakarta Barat", location: "Grogol Petamburan", roi: 1.98, coordinates: [106.78648868665796, -6.163602313800145] },
  { region: "Jakarta Barat", location: "Kebon Jeruk", roi: 1.64, coordinates: [106.76910552898524, -6.189552463638793] },
  { region: "Jakarta Barat", location: "Kembangan", roi: 1.7, coordinates: [106.7421095712043, -6.198645683323483] },
  { region: "Jakarta Barat", location: "Palmerah", roi: 1.41, coordinates: [106.79557861452486, -6.191755749700327] },
  { region: "Jakarta Barat", location: "Taman Sari", roi: 1.58, coordinates: [106.8183283069209, -6.148098097838871] },
  { region: "Jakarta Barat", location: "Cengkareng", roi: 1.71, coordinates: [106.73643810567579, -6.15150490933449] },
  { region: "Jakarta Barat", location: "Kalideres", roi: 1.46, coordinates: [106.70336809651265, -6.133975123077993] },
  { region: "Jakarta Barat", location: "Tambora", roi: 1.77, coordinates: [106.8121, -6.1489] },

  { region: "Jakarta Pusat", location: "Gambir", roi: 1.57, coordinates: [106.81799989494888, -6.171484911713849] },
  { region: "Jakarta Pusat", location: "Johar Baru", roi: 1.63, coordinates: [106.85454491912121, -6.182085994561501] },
  { region: "Jakarta Pusat", location: "Kemayoran", roi: 1.57, coordinates: [106.85501189164965, -6.161638794592615] },
  { region: "Jakarta Pusat", location: "Menteng", roi: 2.06, coordinates: [106.83530844176379, -6.195967628500286] },
  { region: "Jakarta Pusat", location: "Sawah Besar", roi: 1.69, coordinates: [106.83315681850063, -6.15413477727676] },
  { region: "Jakarta Pusat", location: "Senen", roi: 1.48, coordinates: [106.84591922133342, -6.184340438871684] },
  { region: "Jakarta Pusat", location: "Cempaka Putih", roi: 1.85, coordinates: [106.86813481741193, -6.180951779303712] },
  { region: "Jakarta Pusat", location: "Tanah Abang", roi: 1.45, coordinates: [106.80926487937208, -6.205573919594091] },

  { region: "Jakarta Utara", location: "Kepulauan Seribu", roi: 1.73, coordinates: [106.6167, -5.6167] },
  { region: "Jakarta Utara", location: "Koja", roi: 1.3, coordinates: [106.90602575876211, -6.125362189877983] },
  { region: "Jakarta Utara", location: "Kelapa Gading", roi: 1.42, coordinates: [106.90395515321268, -6.161440510143225] },
  { region: "Jakarta Utara", location: "Pademangan", roi: 1.73, coordinates: [106.85207441722862, -6.122389205237173] },
  { region: "Jakarta Utara", location: "Penjaringan", roi: 1.84, coordinates: [106.76670279009302, -6.118874417282457] },
  { region: "Jakarta Utara", location: "Tanjung Priok", roi: 1.72, coordinates: [106.87434236027634, -6.135575381911825] }
];


const mapRegionName = (regionName: string): string => {
  if (!regionName) return "Jakarta Pusat";

  const upperName = regionName.toUpperCase();

  if (upperName.includes("BARAT")) return "Jakarta Barat";
  if (upperName.includes("PUSAT")) return "Jakarta Pusat";
  if (upperName.includes("SELATAN")) return "Jakarta Selatan";
  if (upperName.includes("TIMUR")) return "Jakarta Timur";
  if (upperName.includes("UTARA")) return "Jakarta Utara";

  return "Jakarta Pusat";
};

interface BarsProps {
  regionName?: string;
  onRegionBarZoom?: (center: [number, number]) => void;
}

const Bars: React.FC<BarsProps> = ({ regionName = "", onRegionBarZoom }) => {
  const mappedRegion = mapRegionName(regionName);

  const filteredData = ROIData.filter((item) => item.region === mappedRegion);

  const chartData =
    filteredData.length > 0
      ? filteredData.map((item) => ({
          ...item,
          location: item.location,
          coordinates: item.coordinates,
        }))
      : Object.entries(
          ROIData.reduce((acc, item) => {
            if (!acc[item.region]) {
              acc[item.region] = { region: item.region, totalROI: 0, count: 0 };
            }
            acc[item.region].totalROI += item.roi;
            acc[item.region].count += 1;
            return acc;
          }, {} as Record<string, { region: string; totalROI: number; count: number }>)
        ).map(([region, data]) => ({
          region,
          location: region,
          roi: parseFloat((data.totalROI / data.count).toFixed(1)),
          coordinates: ROIData.find((item) => item.region === region)
            ?.coordinates,
        }));

  const handleBarClick = (data: any) => {
    if (
      data !== undefined &&
      data.activePayload !== undefined &&
      onRegionBarZoom
    ) {
      onRegionBarZoom(data.activePayload[0].payload.coordinates);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-[#17488D] mb-4">
        {filteredData.length > 0
          ? `ROI per Kecamatan di ${mappedRegion} (2024)`
          : "ROI Rata-rata per Wilayah Jakarta"}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} onClick={handleBarClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={filteredData.length > 0 ? "location" : "region"} />
          <YAxis domain={[0, 2.25]} />
          <Tooltip formatter={(value) => [`${value}%`, "ROI"]} />
          <Legend />
          <Bar
            dataKey="roi"
            fill="#17488D"
            name="ROI (%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Bars;
