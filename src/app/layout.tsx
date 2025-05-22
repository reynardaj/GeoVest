// layout.tsx
import React from "react";
import type { Metadata } from "next";
import './globals.css';
import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "GeoVest - AI-Powered Geospatial Investment Insights",
  description:
    "Make smarter investment decisions with AI-driven geospatial insights on property markets, historical trends, and price movements.",
  icons: {
    icon: '/logo1.svg'
  }
};

interface ChildProps {
  firstTimeForm?: boolean;
  dashboard?: boolean;
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const user = await currentUser();
  const isSignedIn = !!user;

  if (user) {
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;
    const lastSignInAt = user.lastSignInAt ? new Date(user.lastSignInAt) : null;
    const isFirstTimeSignIn = createdAt && lastSignInAt && createdAt.getTime() === lastSignInAt.getTime();

    const childrenProps = React.isValidElement(children) ? (children.props as ChildProps) : {};
    const isFirstTimeFormPage = childrenProps.firstTimeForm;
    const isDashboardPage = childrenProps.dashboard;

    if (isFirstTimeSignIn && !isFirstTimeFormPage) {
      redirect("/form");
    } else if (!isFirstTimeSignIn && isDashboardPage) {
      redirect("/dashboard");
    }
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* ... head content ... */}
        </head>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}