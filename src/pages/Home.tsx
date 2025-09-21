import React from 'react';
import { Hero } from '../components/Home/Hero';
import { FeaturedSuppliers } from '../components/Home/FeaturedSuppliers';
import { Features } from '../components/Home/Features';

export function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedSuppliers />
      <Features />
    </div>
  );
}