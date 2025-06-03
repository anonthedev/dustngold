import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { artSchema } from '@/lib/schemas';
import { ArtTypeSelector } from './art-type-selector';
import { SearchInput } from './search-input';
import { UrlInput } from './url-input';
import { TagsInput } from './tags-input';
import { ArtistsInput } from './artists-input';
import { PublishedDate } from './published-date';
import { useAddArtMutation } from '@/lib/hooks/use-art-queries';

export function ArtForm() {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(artSchema),
    defaultValues: {
      type: 'music' as const,
      name: '',
      url: '',
      description: undefined,
      image_url: '',
      tags: [] as string[],
      artist: [] as string[],
      published_on: null,
    },
  });
  
  // Get the current art type to conditionally render the components
  const currentArtType = watch('type');
  
  // Use the add art mutation
  const addArtMutation = useAddArtMutation(session?.user?.id || '');
  
  const onSubmit = (data: any) => {
    if (!session || !session.user?.id) {
      toast.error('You must be logged in to add art');
      return;
    }
    
    setSubmitting(true);
    // Pass the user ID from the session
    addArtMutation.mutate(data);
  };
  
  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <ArtTypeSelector setValue={setValue} />
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          {currentArtType === 'movie' || currentArtType === 'book' || currentArtType === 'music' ? (
            <SearchInput type={currentArtType} register={register} setValue={setValue} />
          ) : (
            <Input
              id="name"
              placeholder="Enter name"
              {...register('name')}
            />
          )}
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            URL
          </label>
          <UrlInput register={register} setValue={setValue} watch={watch} />
          {errors.url && (
            <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <Input
            id="description"
            placeholder="Enter description"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium mb-2">
            Cover Art URL
          </label>
          <Input
            id="image_url"
            placeholder="Enter cover art URL"
            {...register('image_url')}
          />
          {errors.image_url && (
            <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tags
          </label>
          <TagsInput />
        </div>

        {/* Artist/Author field for all art types */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {currentArtType === 'movie' ? 'Director/Artist' : 'Artist/Author'}
          </label>
          <ArtistsInput artType={currentArtType} setValue={setValue} />
        </div>
        
        {/* Published date field for all art types */}
        <div>
          <label htmlFor="published_on" className="block text-sm font-medium mb-2">
            {currentArtType === 'movie' ? 'Release Date' : 'Published Date'}
          </label>
          <PublishedDate artType={currentArtType} setValue={setValue} />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={addArtMutation.isPending || !session || submitting}
            className="w-full cursor-pointer"
          >
            {addArtMutation.isPending || submitting ? 'Adding...' : 'Add Art'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
