import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./style.css";
import { RestaurantProvider } from "./context/RestaurantContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RestaurantPredict - Inventory & Sales Management",
  description:
    "Smart system for predicting restaurant inventory needs, managing promotions, and optimizing food usage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RestaurantProvider>
          {children}
        </RestaurantProvider>
      </body>
    </html>
  );
}
