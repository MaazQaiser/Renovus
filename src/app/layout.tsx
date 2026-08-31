import type { Metadata } from "next";
import { Fira_Sans, Open_Sans, Source_Serif_4 } from "next/font/google";
import { SessionProvider } from "@/providers/SessionProvider";
import "./globals.css";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Editorial serif, used by the assessment report's headlines and body copy.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Renovus",
    template: "%s · Renovus",
  },
  description: "Renovus AI Agent Platform for portfolio companies.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${firaSans.variable} ${openSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
