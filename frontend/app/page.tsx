"use client";

import Contact from "@/components/landing/Contact";
import Features from "@/components/landing/Features";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Proof from "@/components/landing/Proof";
import ScrollProgress from "@/components/landing/ScrollProgress";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Hero />
      <Features />
      <HowItWorks />
      <Proof />
      <Pricing />
      <Contact />
    </>
  );
}
