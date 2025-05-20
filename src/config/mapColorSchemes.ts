// Color schemes for different layer types
export const CLUSTER_COLOR_SCHEMES = {
  default: {
    colors: ["#51bbd6", "#f1f075", "#f28cb1"], // Default colors for <100, 100-750, >750 points
    opacity: 0.8,
  },
  hospital: {
    colors: ["#FF6B6B", "#FF9F43", "#FFD166"], // Red to orange to yellow
    opacity: 0.9,
  },
  airport: {
    colors: ["#4ECDC4", "#45B7D1", "#4567B7"], // Green to blue
    opacity: 0.85,
  },
  mall: {
    colors: ["#7B68EE", "#9370DB", "#BA55D3"], // Purple shades
    opacity: 0.8,
  },
  school: {
    colors: ["#00C9A7", "#00B894", "#00A878"], // Green shades
    opacity: 0.85,
  },
  rail: {
    colors: ["#63A4FF", "#4A90E2", "#17488D"], // Blue shades
    opacity: 0.7,
  },
  bus: {
    colors: ["#FFD700", "#FFA500", "#FF4500"], // Yellow to orange to red
    opacity: 0.8,
  },
};
