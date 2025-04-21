import Image from "next/image"
import Link from "next/link"

interface NewsCardProps {
  id: string
  title: string
  category: string
  date: string
  image: string
  insights?: boolean
  shortDescription: string
}

export default function NewsCard({ id, title, category, date, image, insights, shortDescription }: NewsCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <Link href={`/news/${id}`}>
        <div className="relative">
          <Image
            src={image}
            alt={title}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-inter text-lg font-bold text-black mb-3">{title}</h3>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 text-[#17488D] p-1 rounded">
              <span className="text-xs">{category}</span>
            </div>
            {insights && (
              <div className="bg-gray-100 text-gray-600 p-1 rounded">
                <span className="text-xs">Insights</span>
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-black font-inter">
            <p>{shortDescription}</p>
          </div>
          <div className="mt-4 text-xs text-black">
            <span>{date}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

