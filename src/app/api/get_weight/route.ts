import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const DEFAULT_WEIGHTS: CriteriaWeights = {
  price: 0.25,
  location: 0.25,
  category: 0.15,
  landArea: 0.1,
  buildingArea: 0.1,
  income: 0.05,
  plan: 0.05,
  time: 0.05
};

function createPrompt(userData: UserFormData): string {
  return `
You are a real estate recommendation expert. Based on the user profile below, determine the optimal weights for property recommendation criteria. The weights must sum to exactly 1.0.

User Profile:
- Job: ${userData.job || 'Not specified'}
- Age: ${userData.age || 'Not specified'}
- Income: ${userData.income || 'Not specified'}
- Budget/Fund: ${userData.fund || 'Not specified'}
- Purchase Plan: ${userData.plan || 'Not specified'}
- Property Type Preference: ${userData.variety || 'Not specified'}
- Time Frame: ${userData.time || 'Not specified'}
- Preferred Location: ${userData.location || 'Not specified'}
- Facility Preferences: ${userData.facility || 'Not specified'}

Consider these factors when determining weights:
1. Young professionals (18-30) typically prioritize location and price
2. Families (30-45) often value building area and facilities
3. Investors may prioritize price and location for ROI
4. High-income users might prioritize location and quality over price
5. Urgent buyers (< 1 year) prioritize availability and location
6. Long-term planners might focus more on investment potential

Criteria to weight:
- price: How important is the property price/budget match
- location: How important is the location preference
- category: How important is the property type match
- landArea: How important is the land size
- buildingArea: How important is the building size
- income: How important is income-to-property alignment
- plan: How important is the purchase plan compatibility
- time: How important is the time frame alignment

Return ONLY a valid JSON object with the weights, no other text:
{
  "price": 0.xx,
  "location": 0.xx,
  "category": 0.xx,
  "landArea": 0.xx,
  "buildingArea": 0.xx,
  "income": 0.xx,
  "plan": 0.xx,
  "time": 0.xx,
  "reasoning": "Brief explanation of the weight distribution"
}

Ensure all weights are between 0.05 and 0.4, and the sum equals exactly 1.0.
`;
}

function normalizeWeights(weights: Partial<CriteriaWeights>): CriteriaWeights {
  const normalizedWeights = {
    price: Math.max(weights.price || 0.05, 0.05),
    location: Math.max(weights.location || 0.05, 0.05),
    category: Math.max(weights.category || 0.05, 0.05),
    landArea: Math.max(weights.landArea || 0.05, 0.05),
    buildingArea: Math.max(weights.buildingArea || 0.05, 0.05),
    income: Math.max(weights.income || 0.05, 0.05),
    plan: Math.max(weights.plan || 0.05, 0.05),
    time: Math.max(weights.time || 0.05, 0.05)
  };

  const sum = Object.values(normalizedWeights).reduce((a, b) => a + b, 0);
  
  Object.keys(normalizedWeights).forEach(key => {
    normalizedWeights[key as keyof CriteriaWeights] = 
      normalizedWeights[key as keyof CriteriaWeights] / sum;
  });

  return normalizedWeights;
}

async function generateWeightsWithAI(userData: UserFormData): Promise<CriteriaWeights> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = createPrompt(userData);
    
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0,
        }
    });
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const aiResponse = JSON.parse(cleanedText);
      
      if (typeof aiResponse === 'object' && aiResponse.price !== undefined) {
        const weights = normalizeWeights({
          price: aiResponse.price,
          location: aiResponse.location,
          category: aiResponse.category,
          landArea: aiResponse.landArea, 
          buildingArea: aiResponse.buildingArea,
          income: aiResponse.income,
          plan: aiResponse.plan,
          time: aiResponse.time
        });
        
        // console.log('AI Generated Weights:', weights);
        // console.log('AI Reasoning:', aiResponse.reasoning);
        
        return weights;
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // console.log('Raw AI response:', text);
    }
    
  } catch (error) {
    console.error('Error generating weights with AI:', error);
  }
  
  return generateRuleBasedWeights(userData);
}

function generateRuleBasedWeights(userData: UserFormData): CriteriaWeights {
  let weights = { ...DEFAULT_WEIGHTS };
  
  if (userData.age) {
    if (userData.age === '18-24') {
      weights.price = 0.35;
      weights.location = 0.30;
      weights.category = 0.15;
      weights.landArea = 0.05;
      weights.buildingArea = 0.05;
      weights.income = 0.05;
      weights.plan = 0.03;
      weights.time = 0.02;
    } else if (userData.age === '25-34') {
      weights.price = 0.30;
      weights.location = 0.25;
      weights.category = 0.20;
      weights.landArea = 0.08;
      weights.buildingArea = 0.08;
      weights.income = 0.05;
      weights.plan = 0.02;
      weights.time = 0.02;
    } else if (userData.age === '35-44') {
      weights.price = 0.25;
      weights.location = 0.20;
      weights.category = 0.15;
      weights.landArea = 0.15;
      weights.buildingArea = 0.15;
      weights.income = 0.05;
      weights.plan = 0.03;
      weights.time = 0.02;
    }
  }
  
  if (userData.job) {
    if (userData.job === 'Pengusaha') {
      weights.price = 0.30;
      weights.location = 0.35;
      weights.category = 0.20;
    } else if (userData.job === 'Mahasiswa') {
      weights.price = 0.40;
      weights.location = 0.25;
      weights.buildingArea = 0.05;
      weights.landArea = 0.05;
    }
  }
  
  if (userData.income) {
    if (userData.income === '< 1 Juta' || userData.income === '1-5 Juta') {
      weights.price = 0.40;
      weights.location = 0.20;
    } else if (userData.income === '100+ Juta') {
      weights.price = 0.15;
      weights.location = 0.35;
      weights.buildingArea = 0.20;
    }
  }
  
  if (userData.time === '< 1 Tahun') {
    weights.time = 0.15;
    weights.plan = 0.10;
    const reduction = 0.20;
    const otherKeys = ['price', 'location', 'category', 'landArea', 'buildingArea', 'income'];
    otherKeys.forEach(key => {
      weights[key as keyof CriteriaWeights] *= (1 - reduction / otherKeys.length);
    });
  }
  
  return normalizeWeights(weights);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userData } = body;

    if (!userData) {
      return NextResponse.json(
        { error: 'User data is required' },
        { status: 400 }
      );
    }

    const weights = await generateWeightsWithAI(userData);
    
    return NextResponse.json({
      success: true,
      weights: weights,
      message: 'Weights generated successfully'
    });

  } catch (error) {
    console.error('Error in get_weight API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to get dynamic weights' },
    { status: 405 }
  );
}