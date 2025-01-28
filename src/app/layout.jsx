import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "400", "700"],
  variable: "--font-poppins",
});
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <body className={poppins.className}> */}
      <body className={`${poppins.variable} font-sans`}>
        <header>
          <Navigation />
        </header>

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}
