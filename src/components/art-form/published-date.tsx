import { Input } from '@/components/ui/input';
import { useArtFormStore } from '@/lib/stores/art-form-store';

interface PublishedDateProps {
  artType: string;
  setValue: any;
}

export function PublishedDate({ artType, setValue }: PublishedDateProps) {
  const { publishedDateStr, setPublishedDateStr } = useArtFormStore();

  return (
    <Input
      id="published_on"
      type="date"
      value={publishedDateStr}
      onChange={(e) => {
        // Update the string state
        setPublishedDateStr(e.target.value);
        
        // Also update the form value with a Date object
        if (e.target.value) {
          setValue('published_on', new Date(e.target.value));
        } else {
          setValue('published_on', null);
        }
      }}
      placeholder={artType === 'movie' ? "Release date" : "Publication date"}
    />
  );
}
