'use client';

import { useArtsStore, Art } from '@/lib/store';
import { getArtById } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArtPage() {
  const params = useParams();
  const { uuid } = params;
  const arts = useArtsStore((state) => state.arts);
  const [art, setArt] = useState<Art | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArt() {
      if (typeof uuid !== 'string') {
        setError('Invalid Art ID.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const artFromStore = arts.find((a) => a.uuid === uuid);

      if (artFromStore) {
        setArt(artFromStore);
        setLoading(false);
      } else {
        try {
          const fetchedArt = await getArtById(uuid);
          setArt(fetchedArt);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to fetch art');
          console.error(e);
        }
        setLoading(false);
      }
    }

    if (uuid) {
      fetchArt();
    }
  }, [uuid, arts]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading art details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-red-500">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!art) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold">Art not found</h1>
        <p>The requested art piece could not be located.</p>
      </div>
    );
  }

  const { name, image_url, description, artist, published_on, tags, type, url, provider_id, submitted_by, created_at, votes } = art;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              width={500}
              height={750}
              className="rounded-lg object-cover w-full h-auto shadow-lg"
            />
          ) : (
            <div className="w-full h-[500px] bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No Image Available</p>
            </div>
          )}
        </div>
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
          
          {artist && artist.length > 0 && (
            <p className="text-xl text-muted-foreground">Artist(s): {artist.join(', ')}</p>
          )}

          {published_on && (
            <p className="text-sm text-muted-foreground">
              Published: {new Date(published_on).toLocaleDateString()}
            </p>
          )}

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="capitalize">{type}</Badge>
            { votes>0 && <p className="text-lg font-semibold">Votes: {votes}</p>}
          </div>

          {description && (
            <div>
              <h2 className="text-2xl font-semibold mt-6 mb-2">Description</h2>
              <p className="text-lg text-muted-foreground whitespace-pre-wrap">{description}</p>
            </div>
          )}

          {url && (
            <Button 
              onClick={() => window.open(url, "_blank")}
              variant={"primary"}
            >
              View Source <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          )}

          {tags && tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">Created: {new Date(created_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
