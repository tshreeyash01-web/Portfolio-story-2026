import type { Metadata } from "next";
import { Fraunces, Space_Mono } from "next/font/google";
import SmoothScroll from "./components/SmoothScroll";
import { AudioProvider } from "./components/Audio";
import Beat0Splash from "./components/beats/Beat0Splash";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Shreeyash Takarkhede — Story",
  description:
    "Industrial designer. Born on the coast, raised across countries, good at change. A story about curiosity, adaptability, and moving upstream.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${spaceMono.variable} h-full antialiased`}
    >
      {/* Beat 0's splash and the nav's mute toggle both need the one <audio>,
          so the provider wraps the whole story. */}
      <body className="min-h-full flex flex-col">
        <AudioProvider>
          <SmoothScroll />
          <Beat0Splash />
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
