import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ROIData {
    region: string;
    location: string;
    roi: number;
}

const ROIData = [
    { region: "Jakarta Pusat", location: "Gambir", roi: 5.75 },
    { region: "Jakarta Pusat", location: "Johar Baru", roi: 5.20 },
    { region: "Jakarta Pusat", location: "Kemayoran", roi: 6.30 },
    { region: "Jakarta Pusat", location: "Menteng", roi: 7.50 },
    { region: "Jakarta Pusat", location: "Sawah Besar", roi: 5.50 },
    { region: "Jakarta Pusat", location: "Senen", roi: 5.10 },
    { region: "Jakarta Pusat", location: "Cempaka Putih", roi: 5.60 },
    { region: "Jakarta Pusat", location: "Tanah Abang", roi: 6.00 },
    { region: "Jakarta Barat", location: "Grogol Petamburan", roi: 6.20 },
    { region: "Jakarta Barat", location: "Kebon Jeruk", roi: 5.80 },
    { region: "Jakarta Barat", location: "Kembangan", roi: 5.70 },
    { region: "Jakarta Barat", location: "Palmerah", roi: 5.40 },
    { region: "Jakarta Barat", location: "Taman Sari", roi: 5.30 },
    { region: "Jakarta Barat", location: "Cengkareng", roi: 5.50 },
    { region: "Jakarta Barat", location: "Kalideres", roi: 4.90 },
    { region: "Jakarta Timur", location: "Cakung", roi: 5.60 },
    { region: "Jakarta Timur", location: "Duren Sawit", roi: 5.30 },
    { region: "Jakarta Timur", location: "Jatinegara", roi: 5.40 },
    { region: "Jakarta Timur", location: "Kramat Jati", roi: 4.80 },
    { region: "Jakarta Timur", location: "Makasar", roi: 4.70 },
    { region: "Jakarta Timur", location: "Matraman", roi: 5.60 },
    { region: "Jakarta Timur", location: "Pulogadung", roi: 5.80 },
    { region: "Jakarta Timur", location: "Pasar Rebo", roi: 5.50 },
    { region: "Jakarta Timur", location: "Bukit Duri", roi: 4.90 },
    { region: "Jakarta Utara", location: "Kepulauan Seribu", roi: 6.50 },
    { region: "Jakarta Utara", location: "Koja", roi: 5.40 },
    { region: "Jakarta Utara", location: "Kelapa Gading", roi: 7.80 },
    { region: "Jakarta Utara", location: "Pademangan", roi: 6.40 },
    { region: "Jakarta Utara", location: "Penjaringan", roi: 6.10 },
    { region: "Jakarta Utara", location: "Tanjung Priok", roi: 5.20 },
    { region: "Jakarta Selatan", location: "Cilandak", roi: 6.40 },
    { region: "Jakarta Selatan", location: "Jagakarsa", roi: 5.50 },
    { region: "Jakarta Selatan", location: "Kebayoran Baru", roi: 7.60 },
    { region: "Jakarta Selatan", location: "Kebayoran Lama", roi: 6.30 },
    { region: "Jakarta Selatan", location: "Mampang Prapatan", roi: 5.40 },
    { region: "Jakarta Selatan", location: "Pancoran", roi: 5.30 },
    { region: "Jakarta Selatan", location: "Pasar Minggu", roi: 5.20 },
    { region: "Jakarta Selatan", location: "Tebet", roi: 5.70 },
    { region: "Jakarta Selatan", location: "Setiabudi", roi: 6.20 }
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
}

const Bars: React.FC<BarsProps> = ({ regionName = "" }) => {
    const mappedRegion = mapRegionName(regionName);
    
    const filteredData = ROIData.filter(item => item.region === mappedRegion);
    
    const chartData = filteredData.length > 0 ? filteredData : 
        Object.entries(
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
        roi: parseFloat((data.totalROI / data.count).toFixed(1))
        }));

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-[#17488D] mb-4">
                {filteredData.length > 0 
                ? `ROI per Kecamatan di ${mappedRegion}`
                : 'ROI Rata-rata per Wilayah Jakarta'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={filteredData.length > 0 ? "location" : "region"} />
                <YAxis domain={[0, 8]} />
                <Tooltip formatter={(value) => [`${value}%`, 'ROI']} />
                <Legend />
                <Bar dataKey="roi" fill="#17488D" name="ROI (%)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Bars;