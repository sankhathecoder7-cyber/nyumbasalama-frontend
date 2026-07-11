import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "NyumbaSalama - Student Housing | UDSM & ARU Dar es Salaam",
  description:
    "Find safe and reliable housing near UDSM and ARU. Rooms, studios, and houses at affordable prices starting from TSh 50,000.",
  keywords: ["housing", "students", "UDSM", "ARU", "Dar es Salaam", "accommodation", "room", "studio"],
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
