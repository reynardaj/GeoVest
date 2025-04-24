import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar
  } from 'recharts';
  import { SelectedPropertyData } from '@/types/map';
  import { useState, useEffect } from 'react';
  
  interface PropertyAnalyticsProps {
    selectedPropertyData: SelectedPropertyData | null;
    regionData?: { regionName: string } | null;
  }
  
  const randomNormal = (mean: number, stdDev: number): number => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // avoid 0
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  };
  
  // Get region-specific growth rates for ROI calculation
  const getROIForArea = (area: string): number => {
    const roiRates: { [key: string]: number } = {
      'Jakarta Barat': 1.42,
      'Jakarta Pusat': 2.03,
      'Jakarta Timur': 1.76,
      'Jakarta Utara': 1.55,
      'Jakarta Selatan': 1.86,
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
      projection.push({ year: new Date().getFullYear() + i, price: parseFloat(price.toFixed(2)) });
    }
  
    return projection;
  };
  
  // Generate completely independent ROI data based on different market trends
  const generateIndependentROIData = (initialPrice: number, regionName: string) => {
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
        trend: i > 0 ? (parseFloat((marketFactor * 100).toFixed(2))) : 0 // Store the yearly trend
      });
    }
    return roiData;
  };
  
  const PropertyAnalytics = ({ selectedPropertyData, regionData }: PropertyAnalyticsProps) => {
    const [regionName, setRegionName] = useState<string>("Jakarta");
  
    // Update region name when regionData changes
    useEffect(() => {
      if (regionData && regionData.regionName) {
        setRegionName(regionData.regionName);
      }
    }, [regionData]);
  
    if (!selectedPropertyData) {
      return (
        <div className="px-4 py-8 text-center">
          <h2 className="text-xl font-bold text-[#17488D] mb-4">Proyeksi Properti</h2>
          <p className="text-gray-600">Pilih properti pada peta untuk melihat analitik.</p>
        </div>
      );
    }
  
    const projectionData = generatePriceProjection(Number(selectedPropertyData.price), regionName);
    // Generate independent ROI data not directly derived from price projection
    const roiData = generateIndependentROIData(Number(selectedPropertyData.price), regionName);

    const displayedRoiData = roiData.filter(item => item.year > new Date().getFullYear());
  
    return (
      <div className="text-black space-y-6 px-4 py-2">
        <div>
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
        </div>
  
        <div>
          <h2 className="text-xl font-bold text-[#17488D] pb-3">
            Proyeksi Harga
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)} jt`}
                domain={['auto', 'auto']}
              />
              <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Harga Proyeksi']} />
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
            ROI Pasar di {regionName}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={displayedRoiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                domain={[0, 'auto']}
              />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'ROI']} />
              <Bar
                dataKey="roi"
                fill="#17488D"
                name="ROI"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  export default PropertyAnalytics;