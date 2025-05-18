import { BASE_MAP_STYLES } from "@/config/mapConstants";
import Image from "next/image";
import { useState } from "react";

interface BaseMapSwitcherProps {
  selectedBaseMapId: string;
  onBaseMapChange: (baseMapId: string) => void;
}

// Define a type for the style preview mapping
interface StylePreviewMap {
  dark: string;
  light: string;
  satellite: string;
  "street-2d-building": string;
  street: string;
}

export default function BaseMapSwitcher({
  selectedBaseMapId,
  onBaseMapChange,
}: BaseMapSwitcherProps) {
  const baseMapStyles = BASE_MAP_STYLES;
  const [isExpanded, setIsExpanded] = useState(false);

  const getPreviewImage = (styleId: keyof StylePreviewMap): string => {
    const styleToPreview: StylePreviewMap = {
      dark: "preview dark.jpg",
      light: "preview light.jpg",
      satellite: "preview satellite.jpg",
      "street-2d-building": "preview street-2d-building.jpg",
      street: "preview street.jpg",
    };
    return styleToPreview[styleId] || "preview light.jpg";
  };

  return (
    <div className="relative">
      {/* Main container */}
      <div
        className="w-24 h-24 cursor-pointer rounded-lg transition-all duration-200 overflow-hidden p-4 shadow-xl bg-white"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Image
          src={`/stylesPreview/${getPreviewImage(
            selectedBaseMapId as keyof StylePreviewMap
          )}`}
          alt={selectedBaseMapId}
          fill
          className="object-cover"
        />
      </div>

      {/* Expanded container */}
      {isExpanded && (
        <div className="absolute bottom-28 left-0 -mb-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4 grid grid-cols-2 gap-2">
            {baseMapStyles.map((style) => (
              <div
                key={style.id}
                className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  onBaseMapChange(style.id);
                  setIsExpanded(false);
                }}
              >
                <div className="aspect-[1/1] ">
                  <Image
                    src={`/stylesPreview/${getPreviewImage(
                      style.id as keyof StylePreviewMap
                    )}`}
                    alt={style.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
