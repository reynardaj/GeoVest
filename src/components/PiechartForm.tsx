import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Define the areas you're interested in
const AREAS = ['Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Pusat'];

const COLORS = ['#97E6DC', '#4CB8C4', '#2F6F8F', '#2F4A6F', '#17488D'];

export default function Piechart() {
    const [pieData, setPieData] = useState<any[]>([]);

    useEffect(() => {
        const fetchGeoData = async () => {
        const response = await fetch('/properties.geojson'); // Adjust path if needed
        const geoData = await response.json();
        
        // Initialize the property count for each area
        const areaCount: { [key: string]: number } = {
            'Jakarta Barat': 0,
            'Jakarta Timur': 0,
            'Jakarta Utara': 0,
            'Jakarta Selatan': 0,
            'Jakarta Pusat': 0,
        };

        // Iterate over each property and classify by area
        geoData.features.forEach((feature: any) => {
            const propertyName = feature.properties.property_name;

            // Check which area the property is located in based on the property name
            for (let area of AREAS) {
                if (propertyName.toLowerCase().includes(area.toLowerCase())) {
                    areaCount[area]++;
                    break;
                }              
            }
        });

        // Prepare the pie chart data
        const data = AREAS.map(area => ({
            name: area,
            value: areaCount[area],
        }));
        
        setPieData(data);
        };

        fetchGeoData();
    }, []);

    return (
        <div>
            <div className="w-[200%] h-64 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={pieData}
                        dataKey="value"
                        cx="25%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        labelLine={false}
                        stroke="none"
                        >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>

                        {/* Centered total label */}
                        <text
                        x="25%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={18}
                        fill="#333"
                        >
                        <tspan x="25%" dy="-0.8em" fontWeight="bold" fontSize={20} fill="#17488D">
                            {pieData.reduce((acc, item) => acc + item.value, 0)}
                        </tspan>
                        <tspan x="25%" dy="1.4em" fontSize={12} fill="#666">
                            Rekomendasi
                        </tspan>
                        <tspan x="25%" dy="1.2em" fontSize={12} fill="#666">
                            Properti
                        </tspan>
                        </text>

                        <Tooltip
                        formatter={(value: number, name: string) =>
                            [`${value} Properti (${((value / 52) * 100).toFixed(1)}%)`, name]
                        }
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center items-start">
                <div className="flex flex-col gap-2 text-sm text-[#17488D] items-start">
                {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                    <span>{item.name}</span>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}