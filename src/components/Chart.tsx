'use client';

import { ScatterChart, Scatter, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Piechart from '../components/Piechart'

const scatterData = [
    { x: 1, y: 6 },
    { x: 2, y: 7.5 },
    { x: 1.5, y: 5 },
    { x: 2.5, y: 3 },
    { x: 3, y: 4.5 },
    { x: 4, y: 6 },
    { x: 4.5, y: 2 },
    { x: 5, y: 6.8 },
    { x: 2, y: 8 },
];

// Additional scatter data for "Harga Properti" vs "Luas Properti"
const scatterData2 = [
    { x: 50, y: 5 },
    { x: 70, y: 6.5 },
    { x: 80, y: 7 },
    { x: 100, y: 8 },
    { x: 120, y: 9 },
    { x: 150, y: 10 },
    { x: 160, y: 11 },
    { x: 180, y: 12 },
    { x: 200, y: 13 },
];

export default function ChartDashboard() {
    return (
        <div className="p-6 space-y-2 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-center text-[#17488D]">Rekomendasi Properti</h2>
      
            <Piechart/>        
            {/* Scatter Plot for Proyeksi Keuntungan Properti */}
            <div>
                <h2 className="text-xl font-semibold text-center text-[#17488D] mt-12 mb-4">
                    Proyeksi Keuntungan Properti
                </h2>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                            <XAxis type="number" dataKey="x" name="Harga Properti" unit=" M" />
                            <YAxis type="number" dataKey="y" name="Keuntungan" unit="%" />
                            <RechartsTooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                formatter={(value: number, name: string) => [`${value}`, name]}
                                labelFormatter={() => ''}
                            />
                            <Scatter name="Properti" data={scatterData} fill="#17488D" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tren Harga Properti Berdasarkan Luas Tanah */}
            <div>
                <h2 className="text-xl font-semibold text-center text-[#17488D] mt-10 mb-4">
                    Tren Harga Properti Berdasarkan Luas Tanah (m²)
                </h2>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                            <XAxis type="number" dataKey="x" name="Luas Properti" unit=" m²" />
                            <YAxis type="number" dataKey="y" name="Harga Properti" unit=" M" />
                            <RechartsTooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                formatter={(value: number, name: string) => [`${value}`, name]}
                                labelFormatter={() => ''}
                            />
                            <Scatter name="Properti" data={scatterData2} fill="#17488D" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}