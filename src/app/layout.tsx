import type { Metadata } from "next";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Concept Compass",
  description: "Transform any keyword into a dynamic, explorable mind map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="absolute top-0 right-0 z-50 flex justify-end items-center p-4 gap-4">
            <SignedOut>
              <SignInButton>
                <button className="bg-card/95 backdrop-blur-sm border border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg font-medium text-sm h-10 px-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium text-sm h-10 px-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-sm">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard: "bg-card border-border shadow-lg",
                      userButtonPopoverActionButton: "text-foreground hover:bg-accent hover:text-accent-foreground",
                      userButtonPopoverActionButtonText: "text-foreground",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
