import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { artTypes } from '@/lib/schemas';
import { useArtFormStore } from '@/lib/stores/art-form-store';

interface ArtTypeSelectorProps {
  setValue: any;
}

export function ArtTypeSelector({ setValue }: ArtTypeSelectorProps) {
  const { resetFormForTypeChange } = useArtFormStore();

  return (
    <Tabs 
      defaultValue="music" 
      onValueChange={(value) => {
        // Set the new type
        setValue('type', value as any);
        
        // Reset form data when changing types
        setValue('name', '');
        setValue('url', '');
        setValue('description', '');
        setValue('image_url', '');
        setValue('published_on', null);
        setValue('artist', []);
        
        // Reset state in store
        resetFormForTypeChange();
      }}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-4">
        {artTypes.map((type) => (
          <TabsTrigger key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
