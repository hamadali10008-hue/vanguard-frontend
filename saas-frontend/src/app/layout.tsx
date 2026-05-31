import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Vanguard SaaS Platform",
  description: "Enterprise Multi-Tenancy Console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}