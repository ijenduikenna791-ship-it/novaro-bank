'use client';
import { useState } from 'react';
import Preloader from '@/components/Preloader';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Partners from '@/components/landing/Partners';
import Features from '@/components/landing/Features';
import Products from '@/components/landing/Products';
import HowItWorks from '@/components/landing/HowItWorks';
import Security from '@/components/landing/Security';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  const [ready, setReady] = useState(false);
  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Navbar ready={ready} />
      <main>
        <Hero ready={ready} />
        <Partners />
        <Features />
        <Products />
        <HowItWorks />
        <Security />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
