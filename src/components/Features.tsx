import type React from "react"
import { BarChart3, Clock, Sliders } from "lucide-react"

export default function Features() {
  return (
    <section className="w-full py-16 px-4 md:px-8 lg:px-12 text-center my-10">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 font-ubuntu-mono leading-tight md:mx-36">
        Data-Driven. Insight-Powered. Smarter Investments.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<img src="/ROI-icon.svg" alt="ROI Analysis Icon" className="w-8 h-8" />}
          title="ROI Analysis"
          description="Visualize the return on investment (ROI) for properties over the past 1, 5, or 10 years, helping you assess historical trends and make data-driven decisions."
        />

        <FeatureCard
          icon={<img src="/TimeMachine-icon.svg" alt="ROI Analysis Icon" className="w-8 h-8" />}
          title="Time Machine"
          description="Project your potential earnings by inputting your investment amount and time frame—instantly see how your property’s value could grow over time."
        />

        <FeatureCard
          icon={<img src="/Filters-icon.svg" alt="ROI Analysis Icon" className="w-8 h-8" />}
          title="Personalized Filters"
          description="Refine your search with advanced filters, including price range, property type, investment options (lease or buy), demographics, and disaster risk levels."
        />
      </div>
    </section>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-black bg-opacity-50 p-6 rounded-xl flex flex-col items-start border border-[#E6FFEA]">
      <div className="bg-[#17488D] p-3 rounded-xl mb-2">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-3 font-ubuntu">{title}</h3>
      <p className="text-white text-sm text-left font-ubuntu">{description}</p>
    </div>
  )
}

