import type { Metadata, Viewport } from "next";
import {
  Inter,
  Space_Grotesk,
  JetBrains_Mono,
  Noto_Sans_Thai,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemedToaster } from "@/components/theme/themed-toaster";
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

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-thai",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "MapTracker · ติดตามแผ่นดินไหวทั่วโลกแบบเรียลไทม์",
    template: "%s · MapTracker",
  },
  description:
    "ติดตามแผ่นดินไหวทั่วโลกแบบเรียลไทม์ด้วยข้อมูลจาก USGS Earthquake Hazards Program — เฝ้าดูพื้นที่ที่คุณสนใจ บันทึกเหตุการณ์ และรับการแจ้งเตือน",
  keywords: [
    "แผ่นดินไหว",
    "earthquake",
    "USGS",
    "แผนที่",
    "seismic",
    "เรียลไทม์",
    "monitoring",
  ],
  authors: [{ name: "MapTracker" }],
  openGraph: {
    title: "MapTracker · ติดตามแผ่นดินไหวทั่วโลกแบบเรียลไทม์",
    description:
      "แผนที่แผ่นดินไหวเรียลไทม์แบบอินเทอร์แอกทีฟ ขับเคลื่อนด้วยข้อมูล USGS",
    type: "website",
    url: appUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f6fb",
  width: "device-width",
  initialScale: 1,
};

// Applies the saved theme before paint to avoid a flash. Default is light.
const themeScript = `try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="th"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${notoThai.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          {children}
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
