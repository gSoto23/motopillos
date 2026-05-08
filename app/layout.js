import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from '@/context/CartContext';
import CartDrawer from './components/CartDrawer';

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata = {
  title: "Motopillos | Premium Original Parts",
  description: "Your ultimate destination for original OEM motorcycle, ATV, and watercraft parts.",
};

import { ThemeProvider } from '@/context/ThemeContext';
import { UIProvider } from '@/context/UIContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <ThemeProvider>
          <UIProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main className="main-content">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </UIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
