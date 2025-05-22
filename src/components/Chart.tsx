'use client';

import { ComposedChart, Bar, Line, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import Piechart from '../components/Piechart'
import quarterlyData from "@/../backend/model/combined_forecast.json";
import propertyData from "@/../public/property_data.json"

type QuarterlyData = { Quarter: number; Value: number }[];

function getAnnualROI(
  data: QuarterlyData,
  currentQuarter: number
): { x: number; y: number }[] {
  const startYear = Math.floor((currentQuarter - 1) / 4) + 1;

  const results: { x: number; y: number }[] = [];
  let pointer = currentQuarter;
  let cumulativeROI = 0;

  for (let i = 0; i < 5; i++) {
    const year = startYear + i;

    const startQ = pointer;
    const endQ = i === 0 ? (year - 1) * 4 + 4 : pointer + 3;

    const yearData = data.filter(
      (d) => d.Quarter >= startQ && d.Quarter <= endQ
    );

    if (yearData.length === 0) continue;

    const averageDecimal =
      yearData.reduce((sum, d) => sum + d.Value / 100, 0) / yearData.length;

    cumulativeROI = (1 + cumulativeROI) * (1 + averageDecimal) - 1;

    results.push({
      x: i + 1,
      y: parseFloat((cumulativeROI * 100).toFixed(2)),
    });

    pointer = endQ + 1;
  }

  return results;
}

const baseQuarter = 89;

function getCurrentQuarter(): number {
  const currentDate = new Date();
  const baseDate = new Date("2025-01-01");
  const diffMonths =
    (currentDate.getFullYear() - baseDate.getFullYear()) * 12 +
    currentDate.getMonth();
  return baseQuarter + Math.floor(diffMonths / 3);
}

const currentQuarter = getCurrentQuarter();
const scatterData = getAnnualROI(quarterlyData, currentQuarter);

interface Property {
  image: string;
  title: string;
  location: string;
  price: number;
  category: string;
  landArea: number;
  buildingArea: number;
  status: string;
  certificateType: string;
  propertyUrl: string;
  coordinates?: [number, number, number];
  fund: string;
  mcdaScore?: number;
}

interface ChartDashboardProps {
  properties?: Property[];
}

const ChartDashboard: React.FC<ChartDashboardProps> = ({ properties = [] }) => {
    return (
        <div className="p-6 space-y-2 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-center text-[#17488D]">Rekomendasi Properti</h2>
            <Piechart properties={properties}/>
            <div>
                <h2 className="text-xl font-semibold text-center text-[#17488D] mt-12 mb-4">
                    ROI Kumulatif Tahunan
                </h2>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart
                            margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
                        >
                            <XAxis
                                type="number"
                                dataKey="x"
                                name="Tahun Ke"
                                label={{ value: "Tahun Ke", position: "insideBottom", offset: -5 }}
                                allowDecimals={false}
                                domain={[0, 5]}
                                ticks={[1, 2, 3, 4, 5]}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name="ROI"
                                unit="%"
                                label={{
                                    value: "ROI (%)",
                                    angle: -90,
                                    position: "insideLeft",
                                    dx: -8
                                }}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: "3 3" }}
                                formatter={(value: number, name: string) => [`${value}`, name]}
                                labelFormatter={() => ''}
                            />
                            <Scatter name="ROI Tahunan" data={scatterData} fill="#17488D" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold text-center text-[#17488D] mt-20 mb-4">
                    Indeks Rumah, Residential & Apartemen per Tahun
                </h2>
                <div className="w-full h-128">
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart
                            data={propertyData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                        <CartesianGrid stroke="#f5f5f5" />
                        <XAxis dataKey="year" />
                        <YAxis
                          label={{
                              value: 'Indeks Properti',
                              angle: -90,
                              position: 'insideLeft',
                              style: { textAnchor: 'middle' },
                          }}
                        />
                        <Tooltip labelFormatter={() => ''} />
                        <Legend layout="vertical" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '14px' }} />
                        <Bar dataKey="housing" name="Housing" barSize={20} fill="#4CB8C4" />
                        <Bar dataKey="apartment" name="Apartment" barSize={20} fill="#17488D" />
                        <Line
                          type="monotone"
                          dataKey="residential_property"
                          name="Residential Property"
                          stroke="#2F4A6F"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default ChartDashboard;