import type { Metadata } from "next";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";
import NavigationProgress from "@/components/NavigationProgress";

export const metadata: Metadata = {
  title: "Saudi Visa Service - Travel Made Easy",
  description:
    /* Hajj removed: original was "Umrah, Tourist, and Hajj visa applications" */
    "Professional support for Umrah and Tourist visa applications with document guidance, application assistance, and status tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-saudi-blue overflow-x-hidden">
        <NavigationProgress />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
