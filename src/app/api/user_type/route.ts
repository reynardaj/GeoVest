import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

type InvestorTypeKey = 'young_investor' | 'long_term_planner' | 'commercial_investor' | 'purpose_driven_investor';

const USER_TYPES: Record<InvestorTypeKey, { title: string; description: string }> = {
  'young_investor': {
    title: 'The Young Investor 🔥',
    description: 'Kamu baru mulai berinvestasi dan ingin mendapatkan properti dengan modal terjangkau serta pertumbuhan nilai yang cepat. Properti kecil seperti apartemen di lokasi strategis bisa menjadi pilihan terbaik untukmu!'
  },
  'long_term_planner': {
    title: 'The Long-Term Planner 📈',
    description: 'Kamu berinvestasi untuk masa depan dan ingin properti yang aman, stabil, dan cocok untuk keluarga. Rumah tapak di area yang berkembang, dekat sekolah dan fasilitas umum, akan membantumu membangun aset jangka panjang.'
  },
  'commercial_investor': {
    title: 'The Commercial Investor 🏢',
    description: 'Kamu memiliki dana besar dan fokus pada properti dengan potensi arus kas yang tinggi dan nilai komersial. Investasi pada ruko, kantor, atau properti campuran di kawasan bisnis akan membantumu memaksimalkan potensi profit.'
  },
  'purpose_driven_investor': {
    title: 'The Purpose-Driven Investor 🌱',
    description: 'Kamu tertarik pada properti yang tidak hanya menguntungkan secara finansial, tapi juga berdampak positif pada lingkungan dan masyarakat. Properti ramah lingkungan di kawasan berkelanjutan bisa menjadi pilihan ideal bagimu.'
  }
};

function isValidInvestorType(type: string): type is InvestorTypeKey {
  return Object.keys(USER_TYPES).includes(type);
}

export async function POST(request: NextRequest) {
  try {
    const { formData } = await request.json();

    if (!formData) {
      return NextResponse.json({ error: 'Form data is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Analyze the following user profile data for a property investment recommendation system and determine which investor type they belong to. 

User Profile:
- Full Name: ${formData.fullName}
- Age: ${formData.age}
- Job: ${formData.job}
- Income: ${formData.income}
- Investment Fund: ${formData.fund}
- Payment Plan: ${formData.plan}
- Property Variety Preferences: ${formData.variety?.join(', ') || 'Not specified'}
- Investment Timeline: ${formData.time}
- Preferred Location: ${formData.location}
- Facility Preferences: ${formData.facility?.join(', ') || 'Not specified'}

Based on this profile, classify the user into ONE of these four investor types:

1. **young_investor**: For users who are just starting to invest, typically younger (18-34), with lower to moderate income and funds (< 500 Juta), looking for affordable properties with quick value growth.

2. **long_term_planner**: For users with moderate to good funds (500 Juta - 5M), stable income, focused on long-term investment, family-oriented, prefer residential properties for living and inheritance.

3. **commercial_investor**: For users with large funds (> 5M), high income, experienced investors or business people, focused on commercial properties, cashflow, and business potential.

4. **purpose_driven_investor**: For users who show interest in sustainable, environmentally friendly, or socially impactful properties, regardless of their financial capacity.

Consider the following factors in your analysis:
- Age and income level
- Investment fund amount
- Property type preferences (residential vs commercial vs mixed)
- Investment timeline
- Overall investment goals and risk tolerance

Respond with ONLY the investor type key (young_investor, long_term_planner, commercial_investor, or purpose_driven_investor). Do not include any explanation or additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const investorType = response.text().trim().toLowerCase();

    if (!isValidInvestorType(investorType)) {
      let fallbackType: InvestorTypeKey = 'young_investor';

      if (formData.fund === '> 5 M') {
        fallbackType = 'commercial_investor';
      } else if (formData.fund === '500 Juta-1 M' || formData.fund === '1-5 M') {
        fallbackType = 'long_term_planner';
      } else if (formData.variety?.includes('Properti ramah lingkungan') || 
                 formData.variety?.includes('Properti berkelanjutan')) {
        fallbackType = 'purpose_driven_investor';
      }

      return NextResponse.json({
        success: true,
        userType: fallbackType,
        title: USER_TYPES[fallbackType].title,
        description: USER_TYPES[fallbackType].description,
        fallback: true
      });
    }

    return NextResponse.json({
      success: true,
      userType: investorType,
      title: USER_TYPES[investorType].title,
      description: USER_TYPES[investorType].description,
      fallback: false
    });

  } catch (error) {
    console.error('Error determining user type:', error);
    
    return NextResponse.json({
      success: true,
      userType: 'young_investor' as InvestorTypeKey,
      title: USER_TYPES.young_investor.title,
      description: USER_TYPES.young_investor.description,
      fallback: true,
      error: 'Used fallback due to API error'
    });
  }
}