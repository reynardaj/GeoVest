"use client";
import NewsCard from "@/components/NewsCard";
import { useState } from "react";

const newsData = [
  { image: "/news/news1.jpg", title: "68 Persen Tanah dan Kekayaan Indonesia Dikuasai oleh Satu Persen Kelompok", source: "Kompas", category: "Market Trends", date: "15 Feb 2025", description: "Description 1" },
  { image: "/news/news2.jpg", title: "68 Persen Tanah dan Kekayaan Indonesia Dikuasai oleh Satu Persen Kelompok", source: "Kompas", category: "Insights", date: "16 Feb 2025", description: "Description 2" },
  { image: "/news/news3.jpg", title: "68 Persen Tanah dan Kekayaan Indonesia Dikuasai oleh Satu Persen Kelompok", source: "Kompas", category: "Policies & Regulations", date: "17 Feb 2025", description: "Description 3" },
  { image: "/news/news4.jpg", title: "68 Persen Tanah dan Kekayaan Indonesia Dikuasai oleh Satu Persen Kelompok", source: "Kompas", category: "Expert Opinion & Analysis", date: "18 Feb 2025", description: "Description 4" },
];

function page() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter news based on selected category
  const filteredNews = selectedCategory === "All"
    ? newsData
    : newsData.filter((news) => news.category === selectedCategory);

  return (
    // <div className=" h-screen bg-center bg-no-repeat" style={{ backgroundImage: "url('/background-news.png')" }}
    // >
    //   news page
    // </div>

    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Navigation with Click Events */}
        <nav className="text-center font-semibold text-gray-800 space-x-6 pb-6">
          {["All", "Market Trends", "Insights", "Policies & Regulations", "Expert Opinion & Analysis"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`hover:text-blue-600 ${selectedCategory === category ? "text-blue-600" : ""}`}
            >
              {category}
            </button>
          ))}
        </nav>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredNews.map((news, index) => (
          <NewsCard key={index} {...news} />
        ))}
        </div>
      </div>
    </div>
  )
}

export default page
