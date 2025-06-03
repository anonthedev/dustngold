'use client';

import { ArtForm } from '@/components/art-form/art-form';

export default function AddArtPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Art</h1>
      <ArtForm />
    </div>
  );
}