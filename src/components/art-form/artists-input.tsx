import { useArtFormStore } from '@/lib/stores/art-form-store';
import MultiInput from '@/components/ui/multi-input';

interface ArtistsInputProps {
  artType: string;
  setValue: any;
}

export function ArtistsInput({ artType, setValue }: ArtistsInputProps) {
  const { artists, currentArtist, setArtists, setCurrentArtist } = useArtFormStore();

  return (
    <div className="space-y-2">
      <MultiInput
        inputs={artists}
        setInputs={(updater) => {
          // Update artists state using the updater function
          const updatedSet = updater(artists);
          setArtists(updatedSet);
          
          // Also update the form field value
          setValue('artist', Array.from(updatedSet));
        }}
        currentInput={currentArtist}
        setCurrentInput={setCurrentArtist}
        placeholder={artType === 'movie' ? "Add directors (press Enter after each name)" : "Add artists (press Enter after each name)"}
        maxInputs={5}
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {Array.from(artists).map((artist) => (
          <div
            key={artist}
            className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2"
          >
            <span>{artist}</span>
            <button
              type="button"
              onClick={() => {
                // Create a new artists set without the current artist
                const updatedArtists = new Set(
                  Array.from(artists).filter(a => a !== artist)
                );
                
                // Update the artists state
                setArtists(updatedArtists);
                
                // Update the form value
                setValue('artist', Array.from(updatedArtists));
              }}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
