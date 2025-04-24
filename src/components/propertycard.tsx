// This goes in src/components/propertycard.tsx
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PropertyCardProps {
    image: string;
    title: string;
    location: string;
    price: string;
    category: string;
    landArea: string;
    coordinates?: [number, number, number]; // Add coordinates to the props
}

export default function PropertyCard({ image, title, location, price, category, landArea, coordinates }: PropertyCardProps) {
    const router = useRouter();

    const handleCardClick = () => {
        if (coordinates) {
          // Store the coordinates in localStorage to retrieve them on the map page
          localStorage.setItem('selectedPropertyCoordinates', JSON.stringify(coordinates));
          // Navigate to the map page
          router.push('/map');
        }
    };

    return (
        <div 
            onClick={handleCardClick}
            className="cursor-pointer border-2 border-[#9eb2cd] bg-white shadow-md rounded-xl overflow-hidden transition-transform duration-300 ease-in-out hover:scale-[102%] hover:shadow-lg"
        >
            <div className="relative h-80 w-full">
                <Image 
                src={image} 
                alt={title} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                style={{ objectFit: 'cover' }} 
                className="rounded-t-xl"
                />
            </div>
            <div className="p-4">
                <h3 className="text-[#17488D] font-bold text-lg line-clamp-3">{title}</h3>
                <p className="text-gray-600 text-sm mb-2">{location}</p>
                <div className="flex justify-between items-center">
                    <p className="text-[#17488D] font-bold">{price}</p>
                    <span className="bg-blue-100 text-[#17488D] text-xs px-2 py-1 rounded-full">
                        {category}
                    </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-600 text-sm">Luas Area: {landArea}</p>
                </div>
            </div>
        </div>
    );
}