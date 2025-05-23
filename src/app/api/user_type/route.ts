import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

type InvestorTypeKey = 'private_investor' | 'corporate_developer' | 'strategic_partner' | 'public_planner' | 'urban_visionary';

const USER_TYPES: Record<InvestorTypeKey, { title: string; description: string }> = {
  'private_investor': {
    title: 'The Private Investor 🧑‍💼',
    description: 'Pengguna individu yang mencari peluang investasi properti secara mandiri. Biasanya berfokus pada pertumbuhan modal atau penghasilan pasif. Mereka membutuhkan rekomendasi properti yang selaras dengan anggaran pribadi dan horizon waktu investasi tertentu.'
  },
  'corporate_developer': {
    title: 'The Corporate Developer 🏢',
    description: 'Perusahaan pengembang properti yang mencari lokasi strategis untuk proyek residensial, komersial, atau mixed-use. Mereka membutuhkan data geospasial yang akurat, izin lahan, proyeksi ROI kawasan, serta potensi pertumbuhan nilai lahan untuk skala besar.'
  },
  'strategic_partner': {
    title: 'The Strategic Partner (B2B) 🤝',
    description: 'Pihak ketiga seperti bank, lembaga keuangan, atau operator infrastruktur yang tertarik untuk berkolaborasi dalam pembangunan kawasan. Mereka membutuhkan analisis risiko kawasan, keterkaitan transportasi, hingga potensi permintaan pasar.'
  },
  'public_planner': {
    title: 'The Public Planner 🏛️',
    description: 'Instansi pemerintah seperti Bappeda, dinas tata ruang, atau kementerian yang bertanggung jawab atas perencanaan kota dan pengawasan tata ruang. Mereka membutuhkan informasi properti berdasarkan peraturan zonasi, status sertifikat seperti HGB atau hak pakai, serta kesesuaian dengan Rencana Tata Ruang Wilayah (RTRW) dan rencana pengadaan lahan strategis.'
  },
  'urban_visionary': {
    title: 'The Urban Visionary 🏙️',
    description: 'Kelompok atau individu yang fokus pada pengembangan kawasan tematik: TOD (Transit-Oriented Development), kawasan hijau, smart city, atau pembangunan berkelanjutan. Mereka mencari properti atau lahan dengan potensi transformatif tinggi berdasarkan infrastruktur yang sedang atau akan dibangun.'
  }
};

function normalizeInvestorType(rawResponse: string): InvestorTypeKey | null {
  // Clean the response
  const cleaned = rawResponse.toLowerCase().trim().replace(/[^\w_]/g, '');
  
  // Direct match
  if (isValidInvestorType(cleaned)) {
    return cleaned;
  }
  
  // Fuzzy matching for common variations
  const typeMap: Record<string, InvestorTypeKey> = {
    'privateinvestor': 'private_investor',
    'private': 'private_investor',
    'individual': 'private_investor',
    'corporatedeveloper': 'corporate_developer',
    'corporate': 'corporate_developer',
    'developer': 'corporate_developer',
    'strategicpartner': 'strategic_partner',
    'strategic': 'strategic_partner',
    'partner': 'strategic_partner',
    'b2b': 'strategic_partner',
    'publicplanner': 'public_planner',
    'public': 'public_planner',
    'planner': 'public_planner',
    'government': 'public_planner',
    'urbanvisionary': 'urban_visionary',
    'urban': 'urban_visionary',
    'visionary': 'urban_visionary',
    'smart': 'urban_visionary'
  };
  
  return typeMap[cleaned] || null;
}

function isValidInvestorType(type: string): type is InvestorTypeKey {
  return Object.keys(USER_TYPES).includes(type);
}

function determineTypeByProfile(formData: any): InvestorTypeKey {
  // Rule-based fallback logic
  const income = formData.income?.toLowerCase() || '';
  const fund = formData.fund?.toLowerCase() || '';
  const job = formData.job?.toLowerCase() || '';
  const variety = formData.variety || [];
  
  // Corporate developer indicators
  if (job.includes('pengusaha') && 
      (fund.includes('5 m') || fund.includes('100+ juta') || fund.includes('500 juta'))) {
    return 'corporate_developer';
  }
  
  // Public planner indicators
  if (job.includes('pendidik') || 
      variety.some((v: string) => v.includes('HGB') || v.includes('hak pakai'))) {
    return 'public_planner';
  }
  
  // Urban visionary indicators
  if (variety.some((v: string) => v.includes('campuran')) ||
      formData.facility?.includes('Transportasi Umum')) {
    return 'urban_visionary';
  }
  
  // Strategic partner indicators  
  if (job.includes('insinyur') && 
      (fund.includes('500 juta') || fund.includes('1-5 m'))) {
    return 'strategic_partner';
  }
  
  // Default to private investor
  return 'private_investor';
}

export async function POST(request: NextRequest) {
  try {
    const { formData } = await request.json();

    if (!formData) {
      return NextResponse.json({ error: 'Form data is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are analyzing a user profile for property investment classification. You must respond with EXACTLY ONE of these five options:

private_investor
corporate_developer  
strategic_partner
public_planner
urban_visionary

User Profile:
- Age: ${formData.age}
- Job: ${formData.job}  
- Income: ${formData.income}
- Investment Fund: ${formData.fund}
- Payment Plan: ${formData.plan}
- Property Types: ${formData.variety?.join(', ') || 'Not specified'}
- Timeline: ${formData.time}
- Location: ${formData.location}
- Facilities: ${formData.facility?.join(', ') || 'Not specified'}

Classification Rules:
- private_investor: Individual investors, employees, students, nurses with personal funds
- corporate_developer: Business owners with large funds (>100M), developers, large-scale projects
- strategic_partner: Engineers, professionals seeking partnerships, B2B focus
- public_planner: Educators, government workers, those interested in HGB/land rights
- urban_visionary: Mixed-use property interest, public transport focus, modern development

Respond with only one of the five exact terms above. No explanation, no punctuation, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawResponse = response.text();
    
    console.log('Raw Gemini response:', rawResponse); // Debug log
    
    const normalizedType = normalizeInvestorType(rawResponse);
    
    if (!normalizedType) {
      console.log('Normalization failed, using rule-based fallback'); // Debug log
      const fallbackType = determineTypeByProfile(formData);
      
      return NextResponse.json({
        success: true,
        userType: fallbackType,
        title: USER_TYPES[fallbackType].title,
        description: USER_TYPES[fallbackType].description,
        fallback: true,
        debug: {
          rawResponse,
          reason: 'Rule-based classification used'
        }
      });
    }

    return NextResponse.json({
      success: true,
      userType: normalizedType,
      title: USER_TYPES[normalizedType].title,
      description: USER_TYPES[normalizedType].description,
      fallback: false,
      debug: {
        rawResponse,
        normalizedType
      }
    });

  } catch (error) {
    console.error('Error determining user type:', error);
    
    const fallbackType = determineTypeByProfile(FormData);
    
    return NextResponse.json({
      success: true,
      userType: fallbackType,
      title: USER_TYPES[fallbackType].title,
      description: USER_TYPES[fallbackType].description,
      fallback: true,
      error: 'Used rule-based fallback due to API error'
    });
  }
}