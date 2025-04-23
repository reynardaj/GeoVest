import Image from "next/image";

interface PropertyCardProps {
    image: string;
    title: string;
    location: string;
    price: number | string;
    category: string;
    profit: number | string;
}
  
const propertycard = ({ image, title, location, price, category, profit }: PropertyCardProps) => {
    return (
        <div className="bg-white rounded-xl shadow outline outline-2 outline-[#b8ccdc] hover:shadow-lg hover:scale-[1.01] transition duration-100 ease-in-out cursor-pointer">
            <img src={image} alt={title} className="rounded-t-xl w-full" />
            <div className="p-4">
                <p className="font-semibold text-[#17488D]">{title}</p>
                <p className="text-sm text-gray-500">{location}</p>
            </div>
            <div className="pb-4 grid grid-cols-3 divide-x-2 divide-[#b8ccdc] text-sm text-left">
                <div className="px-4">
                    <p className="font-medium text-sm text-[#17488D]">Harga Properti</p>
                    <p className="text-xs text-gray-500">{price}</p>
                </div>
                <div className="px-4">
                    <p className="font-medium text-sm text-[#17488D]">Kategori</p>
                    <p className="text-xs text-gray-500">{category}</p>
                </div>
                <div className="px-4">
                    <p className="font-medium text-sm text-[#17488D]">Proyeksi Keuntungan</p>
                    <p className="text-xs text-gray-500">{profit}</p>
                </div>
            </div>
        </div>
    );
};
  
export default propertycard;