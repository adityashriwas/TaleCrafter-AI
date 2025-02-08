import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Provider from "./Provider";
import Header from "./(components)/Header";
import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

const myAppFont = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaleCrafter AI",
  description: "Create stories with TaleCrafter AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={myAppFont.className}>
          <Provider>
            <Header />
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}