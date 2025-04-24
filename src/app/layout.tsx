import type React from "react";
import type { Metadata } from "next";
import './globals.css';
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "GeoVest - AI-Powered Geospatial Investment Insights",
  description:
    "Make smarter investment decisions with AI-driven geospatial insights on property markets, historical trends, and price movements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Ubuntu:wght@400;500;700&family=Ubuntu+Mono:wght@400;700&display=swap"
            rel="stylesheet"
          />
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
            integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
            crossOrigin=""
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}