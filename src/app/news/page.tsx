import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import NewsCard from "@/components/NewsCard"
import NavbarNews from "@/components/NavbarNews"

// News data
const featuredNews = {
  id: "pik-2-development",
  title: "PIK 2 dalam Pembangunan Besar. Bagaimana Dampaknya pada Sektor Properti?",
  category: "Market Trends",
  date: "12 hours ago",
  image: "/placeholder.svg?height=400&width=600",
}

const recommendedNews = [
  {
    id: "market-trends-analysis",
    title: "Bagaimana Suku Bunga Mempengaruhi Tren Properti di Indonesia Tahun Ini?",
    category: "Market Trends",
    date: "1 week ago",
    image: "/recommended-1.png",
  },
  {
    id: "5-faktor-yang-mempengaruhi",
    title: "5 Faktor yang Mempengaruhi Kenaikan Harga Properti di Perkotaan",
    category: "Insights",
    date: "1 week ago",
    image: "/recommended-2.png",
  },
  {
    id: "policies-regulations",
    title: "Jenis Pajak Properti Yang Harus Diketahui Pengusaha Bisnis Properti",
    category: "Policies & Regulations",
    date: "3 hours ago",
    image: "/recommended-3.png",
  },
  {
    id: "expert-opinion",
    title: "Tahun 2025: Waktu Emas untuk Berinvestasi di Properti Rumah",
    category: "Expert Opinion & Analysis",
    date: "4 hours ago",
    image: "/recommended-4.png",
  },
  {
    id: "market-trends-2",
    title: "Menyingkap Area Prospek Residensial di Jakarta Barat",
    category: "Market Trends",
    date: "6 hours ago",
    image: "/recommended-5.png",
  },
]

const newsGrid = [
  {
    id: "68-persen-tanah",
    title: "Ketimpangan Kepemilikan: 68% Tanah Indonesia Dikuasai 1% Kelompok",
    category: "Ekonomi",
    insights: true,
    date: "23 April 2023",
    image: "/grid-1.png",
    shortDescription: "Studi terbaru mengungkap ketimpangan kepemilikan tanah di Indonesia, memicu perdebatan kebijakan...",
  },
  {
    id: "intellectual-property",
    title: "Hak Kekayaan Intelektual: Mengapa Itu Penting bagi Startup?",
    category: "Bisnis",
    insights: true,
    date: "10 Mei 2023",
    image: "/grid-2.png",
    shortDescription: "Perlindungan hak kekayaan intelektual dapat menentukan keberlanjutan bisnis startup di era digital...",
  },
  {
    id: "buying-vs-renting",
    title: "Beli atau Sewa Properti? Ini Pertimbangan yang Harus Diketahui",
    category: "Properti",
    insights: true,
    date: "5 Juni 2023",
    image: "/grid-3.png",
    shortDescription: "Keputusan antara membeli atau menyewa rumah bergantung pada faktor ekonomi dan gaya hidup...",
  },
  {
    id: "for-rent",
    title: "Tren Sewa Properti 2024: Harga Naik, Permintaan Stabil",
    category: "Properti",
    insights: true,
    date: "12 Juli 2023",
    image: "/grid-4.png",
    shortDescription: "Pasar sewa properti mengalami peningkatan harga, tetapi permintaan tetap tinggi di kota besar...",
  },
  {
    id: "investment",
    title: "Investasi Properti: Peluang dan Tantangan di Tahun 2024",
    category: "Keuangan",
    insights: true,
    date: "21 Agustus 2023",
    image: "/grid-5.png",
    shortDescription: "Pakar menyoroti strategi investasi properti yang menguntungkan di tengah kondisi ekonomi saat ini...",
  },
  {
    id: "real-estate",
    title: "Pasar Real Estate Indonesia: Tren Pertumbuhan dan Proyeksi",
    category: "Properti",
    insights: true,
    date: "3 September 2023",
    image: "/grid-6.png",
    shortDescription: "Industri real estate Indonesia terus berkembang dengan berbagai tantangan dan peluang investasi...",
  },
];


export default function NewsPage() {
  return (
    <main className="min-h-screen bg-news">
      <NavbarNews />
      {/* Hero Section with Featured News and Recommended */}
      <section className="py-12 px-4 md:px-8 max-w-[86rem] mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Featured News */}
          <div className="lg:w-2/3 lg:pr-8 mb-8 lg:mb-0">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-black uppercase">BEST OF THE WEEK</h2>
            </div>

            <div>
              <div className="mb-2">
                <span className="text-[#17488D] font-semibold font-ubuntu">{featuredNews.category}</span>
                <span className="text-black ml-1">    •</span>
                <span className="text-black font-semibold text-sm ml-2">{featuredNews.date}</span>
              </div>

              <h1 className="text-2xl md:text-5xl font-bold text-black font-ubuntu-mono my-8 max-w-2xl">{featuredNews.title}</h1>

              <div className="flex space-x-4 text-s text-[#17488D] font-extralight mb-4">
                <span>#PIK2</span>
                <span>#Properti</span>
              </div>

              <div className="flex items-center justify-between mt-8">
                <Link href={`/news/${featuredNews.id}`} className="inline-flex items-center text-black font-bold bg-white hover:bg-[#E6E6E6] p-4 rounded-xl">
                  Read article
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Recommended News */}
          <div className="lg:w-[45%] bg-[#EDF5FA] rounded-xl p-4">
            <h2 className="text-xl font-bold mb-6 text-black">Recommended</h2>

            <div className="space-y-1">
              {recommendedNews.map((news) => (
                <Link
                  href={`/news/${news.id}`}
                  key={news.id}
                  className="flex items-start gap-4 p-2 justify-between rounded-lg hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="mb-1">
                      <span className="text-[#17488D] text-sm font-bold font-ubuntu">{news.category}</span>
                      <span className="text-black ml-1">    •</span>
                      <span className="text-black text-xs ml-2 font-semibold">{news.date}</span>
                    </div>
                    <h3 className="font-inter text-sm font-bold text-black">{news.title}</h3>
                  </div>
                  <Image
                    src={news.image}
                    alt={news.title}
                    width={150}
                    height={100}
                    className="rounded-lg size-24 object-cover"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {newsGrid.map((news) => (
            <NewsCard
              key={news.id}
              id={news.id}
              title={news.title}
              category={news.category}
              date={news.date}
              image={news.image}
              insights={news.insights}
              shortDescription={news.shortDescription}
            />
          ))}
        </div>
      </section>
    </main>
  )
}