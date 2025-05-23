# GeoVest

**Empowering Data-Driven Investment Decisions through Geospatial Analytics and AI.**

GeoVest is a comprehensive platform designed to revolutionize investment analysis, particularly in real estate and regional development. By combining rich geospatial data visualization with advanced AI-driven analytics, GeoVest provides investors and analysts with unparalleled insights to make informed decisions.


## 🌟 Features

GeoVest offers a powerful suite of features to explore, analyze, and understand investment opportunities:

* **Interactive Map Page (Core):**
    * **Dynamic Data Visualization:** Explore regions and properties with interactive map layers showing various demographic (e.g., age, religion, income), economic, and environmental (e.g., flood visibility) data.
    * **Property & Region Details:** Click on regions or properties to view detailed information, including population statistics, area, property specifications, and pricing.
    * **Layer Controls:** Easily toggle visibility and adjust opacity for different data layers (e.g., infrastructure, flood zones, demographic bins).
    * **Price and Category Filtering:** Filter properties based on price ranges, categories, and investment types.
    * **Demographic Binning:** Analyze population distribution by age and religion using dynamically calculated Jenks natural breaks.
    * **Map Drawing Tools:** Utilize drawing tools directly on the map for custom analysis.
    * **Base Map Switching:** Choose from various base map styles to suit your analytical needs.
    * **Mobile Responsiveness:** A fully responsive interface with a dedicated mobile drawer menu for seamless access on smaller devices.

* **Dashboard Page (AI-Powered MCDA):**
    * **LLM-based Multi-Criteria Decision Analysis (MCDA):** Leverage AI to perform complex decision analysis based on multiple criteria, helping users weigh different factors for investment opportunities. (This is a significant feature that sets GeoVest apart!)

* **Landing Page:** A compelling introduction to GeoVest, highlighting its value proposition and core functionalities.

* **News Page:** Stay updated with the latest trends, market insights, and project developments relevant to geospatial investment.


## 🚀 Getting Started

To get GeoVest up and running on your local machine, follow these steps:

### Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
* [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
* [Git](https://git-scm.com/)


### Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/your-username/geovest.git](https://github.com/your-username/geovest.git)
    cd geovest
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables:**
    Create a `.env` and `.env.local` file in the root directory and add your environment variables.

    ```
    # .env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=key
    CLERK_SECRET_KEY=key
    NEXT_PUBLIC_MAPID_MAP_SERVICE_KEY=key

    #.env.local
    NEXT_PUBLIC_SUPABASE_URL=key
    NEXT_PUBLIC_SUPABASE_ANON_KEY=key
    GEMINI_API_KEY=key
    NEXT_PUBLIC_BASE_URL=key
    ```


### Running the Project

To start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## 🛠 Technologies Used

* **Frontend:**
    * [Next.js](https://nextjs.org/) (React Framework)
    * [TypeScript](https://www.typescriptlang.org/)
    * [Tailwind CSS](https://tailwindcss.com/) (for styling)
    * [MapLibre GL JS](https://maplibre.org/) (for interactive maps)
    * [`re-resizable`](https://github.com/bokuweb/re-resizable) (for UI resizing)
    * [Lucide React](https://lucide.dev/icons/) (for icons)
* **Backend:**
    * OpenAI API / Google Gemini API (for LLM integration on Dashboard)


## 📞 Contact

For any questions or inquiries, please open an issue in the GitHub repository or contact:

* [Your Name/Organization Name] - [Your Email Address]
