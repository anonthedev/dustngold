import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useArtsStore } from '@/lib/store';
import { addArt } from '@/lib/api';
import { useArtFormStore } from '../stores/art-form-store';
import { formatDateForInput } from '../utils/art-form-utils';

// Hook for art submission
export const useAddArtMutation = (userId: string) => {
  const router = useRouter();
  const addArtToStore = useArtsStore((state) => state.addArt);
  const { tags, artists } = useArtFormStore();

  return useMutation({
    mutationFn: (formData: any) => {
      // Convert tags Set to array
      formData.tags = Array.from(tags);
      // For non-movie types, set artist from our state
      if (formData.type !== 'movie') {
        formData.artist = Array.from(artists);
      }
      return addArt(formData, userId);
    },
    onSuccess: (data) => {
      addArtToStore(data);
      toast.success('Art added successfully!');
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error('Failed to add art: ' + error.message);
    },
  });
};

// Hook for movie search
export const useProviderSearch = (
  type: 'movie' | 'book' | 'music',
  setValue: any
) => {
  const {
    setTags,
    setArtists,
    setPublishedDateStr,
    setIsSearchingMovie,
    setShowMovieResults,
    setIsSearchingBook,
    setShowBookResults,
    setIsSearchingMusic,
    setShowMusicResults,
    setSelectedMovie,
    setSelectedBook,
    setSelectedMusic,
    setMovieSearch,
    setBookSearch,
    setMusicSearch,
  } = useArtFormStore();

  // Handle item selection
  const handleSelect = async (providerID: string) => {
    try {
      // Set loading state based on type
      if (type === 'movie') {
        setIsSearchingMovie(true);
        setShowMovieResults(false);
      } else if (type === 'book') {
        setIsSearchingBook(true);
        setShowBookResults(false);
      } else if (type === 'music') {
        setIsSearchingMusic(true);
        setShowMusicResults(false);
      }
      
      const response = await fetch(`/api/provider_search?id=${providerID}&type=${type}`);
      const data = await response.json();
      
      if (response.ok) {
        // Set selected item based on type
        if (type === 'movie') {
          setSelectedMovie(data);
          setMovieSearch(data.name);
        } else if (type === 'book') {
          setSelectedBook(data);
          setBookSearch(data.name);
        } else if (type === 'music') {
          setSelectedMusic(data);
          setMusicSearch(data.name);
        }
        
        // Set form values with data
        setValue('name', data.name);
        setValue('description', data.description || '');
        setValue('image_url', data.image_url || '');
        
        // Extract and set tags
        if (data.tags && data.tags.length > 0) {
          setTags(new Set(data.tags.slice(0, 5)));
        }
        
        // Set URL if available
        if (data.url) {
          setValue('url', data.url);
        }
        
        // Set artist
        if (data.artist && data.artist.length > 0) {
          setValue('artist', data.artist);
          // Update artists state for consistency
          setArtists(new Set(data.artist));
        } else {
          // Reset artist field if no artist data
          setValue('artist', []);
          setArtists(new Set());
        }
        
        // Set published date
        let publishedDate: Date | null = null;
        
        if (data.published_on) {
          try {
            publishedDate = new Date(data.published_on);
          } catch (e) {
            console.error(`Error parsing published date:`, e);
          }
        }
        
        // Set the form value and the formatted string for the input
        setValue('published_on', publishedDate);
        setPublishedDateStr(formatDateForInput(publishedDate));
        
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} details loaded successfully!`);
      } else {
        toast.error(`Failed to load ${type} details`);
      }
    } catch (error) {
      console.error(`Error fetching ${type} details:`, error);
      toast.error(`Failed to load ${type} details`);
    } finally {
      // Reset loading state based on type
      if (type === 'movie') {
        setIsSearchingMovie(false);
      } else if (type === 'book') {
        setIsSearchingBook(false);
      } else if (type === 'music') {
        setIsSearchingMusic(false);
      }
    }
  };

  return { handleSelect };
};

// Hook for YouTube data fetching
export const useYoutubeData = (setValue: any) => {
  const { 
    setIsLoadingYoutubeData, 
    setTags, 
    setArtists,
    setPublishedDateStr,
    setMovieSearch,
    setBookSearch,
    setMusicSearch
  } = useArtFormStore();

  const fetchYoutubeVideoData = async (videoId: string, currentType: string) => {
    try {
      setIsLoadingYoutubeData(true);
      
      // Use YouTube Data API via a proxy endpoint to avoid exposing API key
      const response = await fetch(`/api/youtube?videoId=${videoId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video data');
      }
      
      const data = await response.json();
      
      if (data && data.items && data.items.length > 0) {
        const videoData = data.items[0];
        const snippet = videoData.snippet;
        
        // Set form values with YouTube data
        const videoTitle = snippet.title;
        setValue('name', videoTitle);
        setValue('description', snippet.description || '');
        setValue('image_url', snippet.thumbnails.high?.url || snippet.thumbnails.default?.url || '');
        
        // Also update the search field based on current art type
        if (currentType === 'movie') {
          setMovieSearch(videoTitle);
        } else if (currentType === 'book') {
          setBookSearch(videoTitle);
        } else if (currentType === 'music') {
          setMusicSearch(videoTitle);
        }
        
        // Set the channel name as the artist
        const channelName = snippet.channelTitle;
        if (channelName) {
          setArtists(new Set([channelName]));
          setValue('artist', [channelName]);
        }
        
        // Set published date
        if (snippet.publishedAt) {
          const publishedDate = new Date(snippet.publishedAt);
          setValue('published_on', publishedDate);
          setPublishedDateStr(formatDateForInput(publishedDate));
        }
        
        // Set tags if available
        if (snippet.tags && snippet.tags.length > 0) {
          const videoTags = snippet.tags.slice(0, 5);
          setTags(new Set(videoTags));
        }
        
        toast.success('YouTube video details loaded successfully!');
      } else {
        toast.error('No video data found');
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      toast.error('Failed to load YouTube video details');
    } finally {
      setIsLoadingYoutubeData(false);
    }
  };

  return { fetchYoutubeVideoData };
};
