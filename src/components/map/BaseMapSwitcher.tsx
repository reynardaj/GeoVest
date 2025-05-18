import { BASE_MAP_STYLES } from "@/config/mapConstants";

interface BaseMapSwitcherProps {
  selectedBaseMapId: string;
  onBaseMapChange: (baseMapId: string) => void;
}

export default function BaseMapSwitcher({
  selectedBaseMapId,
  onBaseMapChange,
}: BaseMapSwitcherProps) {
  const baseMapStyles = BASE_MAP_STYLES;

  return (
    <div className="mt-6 pt-4 border-t border-gray-700 max-w-40">
      <h3 className="text-lg font-semibold mb-3">Base Map</h3>
      <div className="space-y-2">
        {baseMapStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onBaseMapChange(style.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                  ${
                    selectedBaseMapId === style.id
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  );
}
