import React from 'react';
import { Hero } from '../components/Hero';
import { FeaturedSuppliers } from '../components/FeaturedSuppliers';
import { Features } from '../components/Features';

export function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedSuppliers />
      <Features />
    </div>
  );
}