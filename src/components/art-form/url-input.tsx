import { Input } from '@/components/ui/input';
import { useArtFormStore } from '@/lib/stores/art-form-store';
import { useYoutubeData } from '@/lib/hooks/use-art-queries';
import { extractYoutubeVideoId } from '@/lib/utils/art-form-utils';

interface UrlInputProps {
  register: any;
  setValue: any;
  watch: any;
}

export function UrlInput({ register, setValue, watch }: UrlInputProps) {
  const { isLoadingYoutubeData } = useArtFormStore();
  const { fetchYoutubeVideoData } = useYoutubeData(setValue);
  
  // Handle URL input change to detect YouTube links
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setValue('url', url);
    
    // Check if it's a YouTube or YouTube Music URL
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('music.youtube.com')) {
      const videoId = extractYoutubeVideoId(url);
      
      if (videoId) {
        // If we're on the music tab, set the art type to music
        if (url.includes('music.youtube.com')) {
          setValue('type', 'music');
        }
        
        fetchYoutubeVideoData(videoId, watch('type'));
      }
    }
  };

  return (
    <div className="relative">
      <Input
        id="url"
        placeholder="Enter URL (YouTube links will auto-fill details)"
        {...register('url')}
        onChange={handleUrlChange}
      />
      {isLoadingYoutubeData && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-slate-500 rounded-full border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
