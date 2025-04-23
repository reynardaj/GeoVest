import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer} from 'recharts';

const pieData = [
    { name: 'Rumah di Tebet, Jakarta Selatan', value: 20 },
    { name: 'Apartment di Kebayoran, Jakarta Selatan', value: 12 },
    { name: 'Ruko di Tebet, Jakarta Selatan', value: 10 },
    { name: 'Apartment di Menteng, Jakarta Pusat', value: 10 },
];

const COLORS = ['#97E6DC', '#4CB8C4', '#2F6F8F', '#2F4A6F'];

export default function Piechart(){
    return(
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
                            <tspan x="50%" dy="-0.8em" fontWeight="bold" fontSize={20} fill='#17488D'>
                                {pieData.reduce((acc, item) => acc + item.value, 0)}
                            </tspan>
                            <tspan x="50%" dy="1.4em" fontSize={12} fill="#666">
                                Rekomendasi
                            </tspan>
                            <tspan x="50%" dy="1.2em" fontSize={12} fill="#666">
                                Properti
                            </tspan>
                        </text>

                        <RechartsTooltip
                            formatter={(value: number, name: string) =>
                                [`${value} Properti (${((value / 52) * 100).toFixed(1)}%)`, name]
                            }
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className='flex justify-center items-center'>
                <div className="flex flex-col gap-2 text-sm text-[#17488D] items-start">
                    {pieData.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                            <span>{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}