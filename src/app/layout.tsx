import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "MapTracker · Live Global Seismic Monitor",
    template: "%s · MapTracker",
  },
  description:
    "Track earthquakes worldwide in real time with data from the USGS Earthquake Hazards Program. Watch the regions you care about, bookmark events, and get alerted.",
  keywords: ["earthquake", "seismic", "USGS", "map", "monitoring", "real-time"],
  authors: [{ name: "MapTracker" }],
  openGraph: {
    title: "MapTracker · Live Global Seismic Monitor",
    description:
      "Real-time earthquake monitoring on an interactive world map, powered by USGS.",
    type: "website",
    url: appUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#070810",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-fg)",
            },
          }}
        />
      </body>
    </html>
  );
}
