import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false} session={pageProps.session}>
      <main>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
