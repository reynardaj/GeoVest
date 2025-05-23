import { NextRequest, NextResponse } from 'next/server';

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

interface UserFormData {
  userid: string;
  fullname: string;
  nickname: string;
  job?: string;
  age?: string;
  income?: string;
  fund?: string;
  plan?: string;
  variety?: string;
  time?: string;
  location?: string;
  facility?: string;
}

interface FormData {
  fund?: string;
  location?: string;
  variety?: string[];
  plan?: string;
  time?: string;
  facility?: string;
  [key: string]: any;
}

interface CriteriaWeights {
  price: number;
  location: number;
  category: number;
  landArea: number;
  buildingArea: number;
  income: number;
  plan: number;
  time: number;
}

const DEFAULT_CRITERIA_WEIGHTS: CriteriaWeights = {
  price: 0.25,
  location: 0.25,
  category: 0.15,
  landArea: 0.1,
  buildingArea: 0.1,
  income: 0.05,
  plan: 0.05,
  time: 0.05
};

const FUND_RANKS = {
  "< 100 Juta": 1,
  "100-500 Juta": 2,
  "500 Juta-1 M": 3,
  "1-5 M": 4,
  "> 5 M": 5
};

const INCOME_RANKS = {
  "< 1 Juta": 1,
  "1-5 Juta": 2,
  "5-10 Juta": 3,
  "10-50 Juta": 4,
  "50-100 Juta": 5,
  "100+ Juta": 6
};

const TIME_RANKS = {
  "< 1 Tahun": 1,
  "1-3 Tahun": 2,
  "3-5 Tahun": 3,
  "> 5 Tahun": 4,
  "Belum Menentukan": 2.5
};

const LOCATIONS = [
  "Jakarta Barat", 
  "Jakarta Utara", 
  "Jakarta Selatan", 
  "Jakarta Timur", 
  "Jakarta Pusat"
];

function getPriceRange(price: number): string {
  if (price < 100000000) return "< 100 Juta";
  if (price < 500000000) return "100-500 Juta";
  if (price < 1000000000) return "500 Juta-1 M";
  if (price < 5000000000) return "1-5 M";
  return "> 5 M";
}

async function getDynamicWeights(userData: UserFormData): Promise<CriteriaWeights> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get_weight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.weights) {
      // console.log('Dynamic weights received:', result.weights);
      return result.weights;
    } else {
      throw new Error(result.error || 'Failed to get dynamic weights');
    }
  } catch (error) {
    console.error('Error fetching dynamic weights:', error);
    // console.log('Falling back to default weights');
    return DEFAULT_CRITERIA_WEIGHTS;
  }
}

function recommendProperties(
  allProperties: Property[],
  formData: FormData
): Property[] {
  let filtered = [...allProperties];

  if (formData.fund) {
    filtered = filtered.filter((property) => property.fund === formData.fund);
  }

  if (formData.location && formData.location.length > 0) {
    filtered = filtered.filter((property) =>
      property.location
        .toLowerCase()
        .includes(formData.location!.toLowerCase())
    );
  }

  if (formData.variety && formData.variety.length > 0) {
    filtered = filtered.filter((property) =>
      formData.variety!.some((v: string) =>
        property.category.toLowerCase().includes(v.toLowerCase())
      )
    );
  }

  if (filtered.length === 0) {
    return allProperties;
  }

  return filtered;
}

async function recommendPropertiesWithMCDA(
  allProperties: Property[],
  userData: UserFormData
): Promise<Property[]> {
  const CRITERIA_WEIGHTS = await getDynamicWeights(userData);
  
  // console.log('Using criteria weights:', CRITERIA_WEIGHTS);
  
  const locationKeywords = LOCATIONS.reduce((acc, loc) => {
    const words = loc.toLowerCase().split(' ');
    return [...acc, ...words, loc.toLowerCase()];
  }, [] as string[]);
  
  let eligible = [...allProperties];
  
  const scoredProperties = eligible.map(property => {
    let score = 0;
    
    if (userData.fund && property.fund) {
      if (property.fund === userData.fund) {
        score += CRITERIA_WEIGHTS.price;
      } else {
        const userFundRank = FUND_RANKS[userData.fund as keyof typeof FUND_RANKS] || 3;
        const propertyFundRank = FUND_RANKS[property.fund as keyof typeof FUND_RANKS] || 3;
        const fundProximity = 1 - Math.min(Math.abs(userFundRank - propertyFundRank) / 4, 1);
        score += CRITERIA_WEIGHTS.price * fundProximity;
        if (propertyFundRank < userFundRank) {
          score += 0.05;
        }
      }
    }
    
    if (userData.location && property.location) {
      const propertyLocationLower = property.location.toLowerCase();
      
      if (propertyLocationLower.includes(userData.location.toLowerCase())) {
        score += CRITERIA_WEIGHTS.location;
      } else {
        let maxLocationMatch = 0;
        locationKeywords.forEach(keyword => {
          if (propertyLocationLower.includes(keyword)) {
            maxLocationMatch = Math.max(maxLocationMatch, 0.5);
          }
          
          if (keyword === "jakarta" && propertyLocationLower.includes(keyword)) {
            maxLocationMatch = Math.max(maxLocationMatch, 0.3);
          }
        });
        
        score += CRITERIA_WEIGHTS.location * maxLocationMatch;
      }
    }
    
    if (userData.variety && property.category) {
      const varietyList = userData.variety.split(',').map(v => v.trim().toLowerCase());
      const propertyCategoryLower = property.category.toLowerCase();
      
      let varietyMatchScore = 0;
      varietyList.forEach(variety => {
        if (propertyCategoryLower.includes(variety)) {
          varietyMatchScore = 1;
        } else {
          if ((variety === "residensial" && 
              (propertyCategoryLower.includes("rumah") || 
               propertyCategoryLower.includes("apartment") || 
               propertyCategoryLower.includes("kondominium"))) ||
              (variety === "komersial" && 
              (propertyCategoryLower.includes("toko") || 
               propertyCategoryLower.includes("kantor") || 
               propertyCategoryLower.includes("ruko")))) {
            varietyMatchScore = Math.max(varietyMatchScore, 0.7);
          }
        }
      });
      
      score += CRITERIA_WEIGHTS.category * varietyMatchScore;
    }
    
    const maxLandArea = Math.max(...eligible.map(p => p.landArea || 0));
    if (maxLandArea > 0 && property.landArea) {
      score += CRITERIA_WEIGHTS.landArea * (property.landArea / maxLandArea);
    }
    
    const maxBuildingArea = Math.max(...eligible.map(p => p.buildingArea || 0));
    if (maxBuildingArea > 0 && property.buildingArea) {
      score += CRITERIA_WEIGHTS.buildingArea * (property.buildingArea / maxBuildingArea);
    }
    
    if (userData.plan && property.status) {
      if (userData.plan === "KPR" && property.status === "Dijual") {
        score += CRITERIA_WEIGHTS.plan;
      } 
      else if (userData.plan === "Tunai" && property.price < 1000000000) {
        score += CRITERIA_WEIGHTS.plan;
      }
      else if (userData.plan === "Belum Memutuskan") {
        score += CRITERIA_WEIGHTS.plan * 0.5;
      }
    }
    
    if (userData.income && userData.fund) {
      const incomeRank = INCOME_RANKS[userData.income as keyof typeof INCOME_RANKS] || 3;
      const fundRank = FUND_RANKS[userData.fund as keyof typeof FUND_RANKS] || 3;
      
      if (property.fund) {
        const propertyFundRank = FUND_RANKS[property.fund as keyof typeof FUND_RANKS] || 3;
        
        if (incomeRank <= 3 && propertyFundRank <= fundRank) {
          score += CRITERIA_WEIGHTS.income;
        }
        else if (incomeRank >= 4 && propertyFundRank === fundRank) {
          score += CRITERIA_WEIGHTS.income;
        }
        else if (Math.abs(propertyFundRank - fundRank) <= 1) {
          score += CRITERIA_WEIGHTS.income * 0.5;
        }
      }
    }
    
    if (userData.time && property.status) {
      const timeRank = TIME_RANKS[userData.time as keyof typeof TIME_RANKS] || 2.5;
      
      if (timeRank === 1 && property.status === "Siap Huni") {
        score += CRITERIA_WEIGHTS.time;
      }
      else if (timeRank >= 3 && 
              (property.status === "Siap Huni" || property.status === "Dalam Pembangunan")) {
        score += CRITERIA_WEIGHTS.time;
      }
      else {
        score += CRITERIA_WEIGHTS.time * 0.5;
      }
    }
    
    return { ...property, mcdaScore: Math.min(score, 1.0) };
  });

  const filteredProperties = scoredProperties
    .filter(property => (property.mcdaScore || 0) >= 0.35)
    .sort((a, b) => (b.mcdaScore || 0) - (a.mcdaScore || 0));
  
  return filteredProperties;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { properties, userData, formData, recommendationType } = body;

    if (!properties || !Array.isArray(properties)) {
      return NextResponse.json(
        { error: 'Properties array is required' },
        { status: 400 }
      );
    }

    const propertiesWithFund = properties.map((property: any) => ({
      ...property,
      fund: getPriceRange(property.price)
    }));

    let recommendedProperties: Property[] = [];

    if (recommendationType === 'mcda' && userData) {
      recommendedProperties = await recommendPropertiesWithMCDA(propertiesWithFund, userData);
    } else if (recommendationType === 'basic' && formData) {
      recommendedProperties = recommendProperties(propertiesWithFund, formData);
    } else {
      recommendedProperties = propertiesWithFund;
    }

    return NextResponse.json({
      success: true,
      properties: recommendedProperties,
      totalCount: recommendedProperties.length
    });

  } catch (error) {
    console.error('Error in recommendation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to get recommendations' },
    { status: 405 }
  );
}