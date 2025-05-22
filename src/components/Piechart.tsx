"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

const COLORS = ["#97E6DC", "#4CB8C4", "#2F6F8F", "#2F4A6F", "#17488D"];

const Piechart: React.FC<ChartDashboardProps> = ({ properties = [] }) => {
  const extractJakartaRegion = (title: string): string => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('jakarta timur') || titleLower.includes('jaktim')) {
      return 'Jakarta Timur';
    } else if (titleLower.includes('jakarta barat') || titleLower.includes('jakbar')) {
      return 'Jakarta Barat';
    } else if (titleLower.includes('jakarta utara') || titleLower.includes('jakut')) {
      return 'Jakarta Utara';
    } else if (titleLower.includes('jakarta selatan') || titleLower.includes('jaksel')) {
      return 'Jakarta Selatan';
    } else if (titleLower.includes('jakarta pusat') || titleLower.includes('jakpus')) {
      return 'Jakarta Pusat';
    }
    
    return 'Lainnya';
  };

  const regionCounts = properties.reduce((acc, property) => {
    const region = extractJakartaRegion(property.title);
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(regionCounts)
    .map(([region, count]) => ({
      name: region,
      value: count
    }))
    .sort((a, b) => b.value - a.value);

  const totalRecommendations = properties.length;

  return (
    <div>
      {totalRecommendations > 0 ? (
        <div>
          <div className="w-full h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
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
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={18}
                  fill="#333"
                >
                  <tspan x="50%" dy="-0.8em" fontWeight="bold" fontSize={20} fill="#17488D">
                    {totalRecommendations}
                  </tspan>
                  <tspan x="50%" dy="1.4em" fontSize={12} fill="#000">
                    Rekomendasi
                  </tspan>
                  <tspan x="50%" dy="1.2em" fontSize={12} fill="#000">
                    Properti
                  </tspan>
                </text>

                <Tooltip
                  formatter={(value: number, name: string) =>
                    [`${value} Properti (${((value / totalRecommendations) * 100).toFixed(1)}%)`, name]
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
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Memuat properti...</p>
        </div>
      )}
    </div>
  );
};

export default Piechart;