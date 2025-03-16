import Image from "next/image";

const NewsCard = ({ image, title, source, category, date, description }) => {
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden">
      <div className="relative w-full h-48">
        <Image src={image} alt={title} layout="fill" objectFit="cover" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-600">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 my-2">
          <span className="font-medium">{source}</span>
          <span className="text-gray-400">|</span>
          <span className="font-medium">{category}</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        <div className="mt-2 text-xs text-gray-400">{date}</div>
      </div>
    </div>
  );
};

export default NewsCard;
