'use client';

import { ScatterChart, Scatter, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Piechart from '../components/Piechart'

const scatterData = [
    { x: 0.3, y: 11 },
  { x: 0.5, y: 12.5 },
  { x: 0.5, y: 11.8 },
  { x: 0.7, y: 10.8 },
  { x: 0.72, y: 10.2 },
  { x: 0.9, y: 9 },
  { x: 1.1, y: 7.5 },
  { x: 1.3, y: 5.6 },
  { x: 1.3, y: 6 },
  { x: 1.5, y: 6.6 },
  { x: 1.8, y: 4.2 },
  { x: 2.2, y: 3.5 }
];

// Additional scatter data for "Harga Properti" vs "Luas Properti"
const scatterData2 = [
    { x: 50, y: 0.45 },
    { x: 65, y: 0.6 },
    { x: 80, y: 0.77 },
    { x: 95, y: 0.95 },
    { x: 110, y: 1.08 },
    { x: 125, y: 1.27 },
    { x: 140, y: 1.4 },
    { x: 165, y: 1.65 },
    { x: 200, y: 1.9 },
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