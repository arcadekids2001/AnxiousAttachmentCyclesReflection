import type { Metadata } from "next";
import { StarfieldBackdrop } from "@/components/starfield-backdrop";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA | Learning and Reflection Intervention",
  description:
    "A Learning and Reflection Intervention System for regulating anxious attachment in adult relationships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StarfieldBackdrop />
        {children}
      </body>
    </html>
  );
}
