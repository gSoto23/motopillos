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
  metadataBase: new URL('https://motopillos.com'),
  title: "Motopillos | Repuestos 100% Originales para Moto",
  description: "Encuentra repuestos originales OEM para Honda, Yamaha, Suzuki, Kawasaki y CFMOTO. Importación directa con garantía de ajuste perfecto.",
  keywords: ["repuestos originales", "motos", "OEM", "Honda", "Yamaha", "Kawasaki", "Suzuki", "CFMOTO", "motocicletas", "piezas de moto"],
  authors: [{ name: "Motopillos" }],
  creator: "Motopillos",
  publisher: "Motopillos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Motopillos | Repuestos 100% Originales",
    description: "Encuentra repuestos originales OEM para Honda, Yamaha, Suzuki, Kawasaki y CFMOTO. Importación directa a tu puerta.",
    url: "https://motopillos.com",
    siteName: "Motopillos",
    images: [
      {
        url: "/logobk.jpeg",
        width: 800,
        height: 600,
        alt: "Motopillos Logo",
      },
    ],
    locale: "es_CR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motopillos | Repuestos Originales",
    description: "Encuentra repuestos originales OEM para tu moto.",
    images: ["/logobk.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/fav/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/fav/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/fav/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/fav/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/fav/apple-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/fav/apple-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/fav/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/fav/apple-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/fav/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/fav/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/fav/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/fav/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/fav/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/fav/apple-icon-precomposed.png',
      },
    ],
  },
  manifest: '/fav/manifest.json',
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
