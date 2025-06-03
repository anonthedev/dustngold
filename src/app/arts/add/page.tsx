'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MultiInput from '@/components/ui/multi-input';
import { Card } from '@/components/ui/card';
import { addArt } from '@/lib/api';
import { artSchema, artTypes } from '@/lib/schemas';
import { useArtsStore } from '@/lib/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import debounce from 'lodash.debounce';

// Helper function to format a date as YYYY-MM-DD for date inputs
function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Function to extract YouTube video ID from various YouTube URL formats
const extractYoutubeVideoId = (url: string): string | null => {
  // Regular expressions for different YouTube URL formats
  const regexPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/, // Standard and shortened URLs
    /youtube\.com\/embed\/([^?\s]+)/, // Embed URLs
    /youtube\.com\/v\/([^?\s]+)/, // Old embed URLs
    /music\.youtube\.com\/watch\?v=([^&\s]+)/ // YouTube Music URLs
  ];

  for (const pattern of regexPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

export default function AddArtPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const addArtToStore = useArtsStore((state) => state.addArt);
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [artists, setArtists] = useState<Set<string>>(new Set());
  const [currentTag, setCurrentTag] = useState('');
  const [currentArtist, setCurrentArtist] = useState('');
  const [movieSearch, setMovieSearch] = useState('');
  const [movieSearchResults, setMovieSearchResults] = useState<any[]>([]);
  const [showMovieResults, setShowMovieResults] = useState(false);
  const [isSearchingMovie, setIsSearchingMovie] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  
  const [bookSearch, setBookSearch] = useState('');
  const [bookSearchResults, setBookSearchResults] = useState<any[]>([]);
  const [showBookResults, setShowBookResults] = useState(false);
  const [isSearchingBook, setIsSearchingBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  
  const [musicSearch, setMusicSearch] = useState('');
  const [musicSearchResults, setMusicSearchResults] = useState<any[]>([]);
  const [showMusicResults, setShowMusicResults] = useState(false);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  
  const [isLoadingYoutubeData, setIsLoadingYoutubeData] = useState(false);
  const [publishedDateStr, setPublishedDateStr] = useState('');
  const movieSearchResultsRef = useRef<HTMLDivElement>(null);
  const bookSearchResultsRef = useRef<HTMLDivElement>(null);
  const musicSearchResultsRef = useRef<HTMLDivElement>(null);

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
  
  // Get the current art type to conditionally render the movie search
  const currentArtType = watch('type');

  const addArtMutation = useMutation({
    mutationFn: (formData: any) => {
      // Convert tags Set to array
      formData.tags = Array.from(tags);
      // For non-movie types, set artist from our state
      if (formData.type !== 'movie') {
        formData.artist = Array.from(artists);
      }
      return addArt(formData, session?.user?.id || '');
    },
    onSuccess: (data) => {
      addArtToStore(data);
      toast.success('Art added successfully!');
      router.push('/');
    },
    onError: (error) => {
      toast.error('Failed to add art: ' + error.message);
    },
  });

  // Handle closing the search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (movieSearchResultsRef.current && !movieSearchResultsRef.current.contains(event.target as Node)) {
        setShowMovieResults(false);
      }
      
      if (bookSearchResultsRef.current && !bookSearchResultsRef.current.contains(event.target as Node)) {
        setShowBookResults(false);
      }
      
      if (musicSearchResultsRef.current && !musicSearchResultsRef.current.contains(event.target as Node)) {
        setShowMusicResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search function for movies
  const debouncedMovieSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setMovieSearchResults([]);
        setIsSearchingMovie(false);
        return;
      }

      try {
        const response = await fetch(`/api/provider_search?query=${encodeURIComponent(query)}&type=movie`);
        const data = await response.json();
        
        if (response.ok && data.results) {
          setMovieSearchResults(data.results);
        } else {
          setMovieSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching movies:', error);
        setMovieSearchResults([]);
      } finally {
        setIsSearchingMovie(false);
      }
    }, 500),
    []
  );

  // Debounced search function for books
  const debouncedBookSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setBookSearchResults([]);
        setIsSearchingBook(false);
        return;
      }

      try {
        const response = await fetch(`/api/provider_search?query=${encodeURIComponent(query)}&type=book`);
        const data = await response.json();
        
        if (response.ok && data.results) {
          setBookSearchResults(data.results);
        } else {
          setBookSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching books:', error);
        setBookSearchResults([]);
      } finally {
        setIsSearchingBook(false);
      }
    }, 500),
    []
  );
  
  // Debounced search function for music
  const debouncedMusicSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setMusicSearchResults([]);
        setIsSearchingMusic(false);
        return;
      }

      try {
        const response = await fetch(`/api/provider_search?query=${encodeURIComponent(query)}&type=music`);
        const data = await response.json();
        
        if (response.ok && data.results) {
          setMusicSearchResults(data.results);
        } else {
          setMusicSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching music:', error);
        setMusicSearchResults([]);
      } finally {
        setIsSearchingMusic(false);
      }
    }, 500),
    []
  );

  // Handle movie search input change
  const handleMovieSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setMovieSearch(query);
    
    if (query.length >= 2) {
      setIsSearchingMovie(true);
      setShowMovieResults(true);
      debouncedMovieSearch(query);
    } else {
      setMovieSearchResults([]);
      setShowMovieResults(false);
    }
  };
  
  // Handle book search input change
  const handleBookSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setBookSearch(query);
    
    if (query.length >= 2) {
      setIsSearchingBook(true);
      setShowBookResults(true);
      debouncedBookSearch(query);
    } else {
      setBookSearchResults([]);
      setShowBookResults(false);
    }
  };
  
  // Handle music search input change
  const handleMusicSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setMusicSearch(query);
    
    if (query.length >= 2) {
      setIsSearchingMusic(true);
      setShowMusicResults(true);
      debouncedMusicSearch(query);
    } else {
      setMusicSearchResults([]);
      setShowMusicResults(false);
    }
  };

  // Handle movie selection
  const handleSelectMovie = async (providerID: string) => {
    try {
      setIsSearchingMovie(true);
      setShowMovieResults(false);
      
      const response = await fetch(`/api/provider_search?id=${providerID}&type=movie`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedMovie(data);
        
        // Set form values with movie data
        setValue('name', data.name);
        // Update the movie search field to reflect the title
        setMovieSearch(data.name);
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
        
        // Set director/artist
        if (data.artist && data.artist.length > 0) {
          setValue('artist', data.artist);
          // Update artists state for consistency
          setArtists(new Set(data.artist));
        } else {
          // Reset artist field if no director data
          setValue('artist', []);
          setArtists(new Set());
        }
        
        // Set published date
        let publishedDate: Date | null = null;
        
        if (data.published_on) {
          try {
            publishedDate = new Date(data.published_on);
          } catch (e) {
            console.error('Error parsing published date:', e);
          }
        }
        
        // Set the form value and the formatted string for the input
        setValue('published_on', publishedDate);
        setPublishedDateStr(formatDateForInput(publishedDate));
        
        toast.success('Movie details loaded successfully!');
      } else {
        toast.error('Failed to load movie details');
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
      toast.error('Failed to load movie details');
    } finally {
      setIsSearchingMovie(false);
    }
  };
  
  // Handle book selection
  const handleSelectBook = async (providerID: string) => {
    try {
      setIsSearchingBook(true);
      setShowBookResults(false);
      
      const response = await fetch(`/api/provider_search?id=${providerID}&type=book`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedBook(data);
        
        // Set form values with book data
        setValue('name', data.name);
        // Update the book search field to reflect the title
        setBookSearch(data.name);
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
        
        // Set author/artist
        if (data.artist && data.artist.length > 0) {
          setValue('artist', data.artist);
          // Update artists state for consistency
          setArtists(new Set(data.artist));
        } else {
          // Reset artist field if no author data
          setValue('artist', []);
          setArtists(new Set());
        }
        
        // Set published date
        let publishedDate: Date | null = null;
        
        if (data.published_on) {
          try {
            publishedDate = new Date(data.published_on);
          } catch (e) {
            console.error('Error parsing published date:', e);
          }
        }
        
        // Set the form value and the formatted string for the input
        setValue('published_on', publishedDate);
        setPublishedDateStr(formatDateForInput(publishedDate));
        
        toast.success('Book details loaded successfully!');
      } else {
        toast.error('Failed to load book details');
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast.error('Failed to load book details');
    } finally {
      setIsSearchingBook(false);
    }
  };
  
  // Handle music selection
  const handleSelectMusic = async (providerID: string) => {
    try {
      setIsSearchingMusic(true);
      setShowMusicResults(false);
      
      const response = await fetch(`/api/provider_search?id=${providerID}&type=music`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedMusic(data);
        
        // Set form values with music data
        setValue('name', data.name);
        // Update the music search field to reflect the title
        setMusicSearch(data.name);
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
            console.error('Error parsing published date:', e);
          }
        }
        
        // Set the form value and the formatted string for the input
        setValue('published_on', publishedDate);
        setPublishedDateStr(formatDateForInput(publishedDate));
        
        toast.success('Music details loaded successfully!');
      } else {
        toast.error('Failed to load music details');
      }
    } catch (error) {
      console.error('Error fetching music details:', error);
      toast.error('Failed to load music details');
    } finally {
      setIsSearchingMusic(false);
    }
  };

  // Function to fetch YouTube video data
  const fetchYoutubeVideoData = async (videoId: string) => {
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
        // This is necessary because the form uses hidden inputs for name in some art types
        const currentType = watch('type');
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
        
        fetchYoutubeVideoData(videoId);
      }
    }
  };

  const onSubmit = (data: any) => {
    if (!session || !session.user?.id) {
      toast.error('You must be logged in to add art');
      return;
    }
    
    // Pass the user ID from the session
    addArtMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Art</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
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
                setPublishedDateStr('');
                setTags(new Set());
                setArtists(new Set());
                setValue('artist', []);
                
                // Reset search state
                setMovieSearch('');
                setMovieSearchResults([]);
                setShowMovieResults(false);
                setSelectedMovie(null);
                
                setBookSearch('');
                setBookSearchResults([]);
                setShowBookResults(false);
                setSelectedBook(null);
                
                setMusicSearch('');
                setMusicSearchResults([]);
                setShowMusicResults(false);
                setSelectedMusic(null);
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
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            {currentArtType === 'movie' ? (
              <div className="relative">
                <Input
                  id="movieSearch"
                  placeholder="Search for a movie..."
                  value={movieSearch}
                  onChange={handleMovieSearchChange}
                  autoComplete="off"
                />
                {isSearchingMovie && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-slate-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
                {showMovieResults && movieSearchResults.length > 0 && (
                  <div 
                    ref={movieSearchResultsRef}
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg max-h-60 overflow-auto border border-slate-200 dark:border-slate-700"
                  >
                    <ul className="py-1">
                      {movieSearchResults.map((movie) => (
                        <li 
                          key={movie.provider_id}
                          className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                          onClick={() => handleSelectMovie(movie.provider_id)}
                        >
                          {movie.image_url ? (
                            <img src={movie.image_url} alt={movie.name} className="h-10 w-7 object-cover" />
                          ) : (
                            <div className="h-10 w-7 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                              No img
                          </div>
                          )}
                          <div>
                            <div className="font-medium">{movie.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {movie.published_on ? new Date(movie.published_on).getFullYear() : ''}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {showMovieResults && movieSearchResults.length === 0 && movieSearch.length >= 2 && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isSearchingMovie ? "Loading..." : "No movies found. Please try a different search or enter details manually."}
                    </p>
                  </div>
                )}
                <Input
                  type="hidden"
                  id="name"
                  {...register('name')}
                />
              </div>
            ) : currentArtType === 'book' ? (
              <div className="relative">
                <Input
                  id="bookSearch"
                  placeholder="Search for a book..."
                  value={bookSearch}
                  onChange={handleBookSearchChange}
                  autoComplete="off"
                />
                {isSearchingBook && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-slate-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
                {showBookResults && bookSearchResults.length > 0 && (
                  <div 
                    ref={bookSearchResultsRef}
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg max-h-60 overflow-auto border border-slate-200 dark:border-slate-700"
                  >
                    <ul className="py-1">
                      {bookSearchResults.map((book) => (
                        <li 
                          key={book.provider_id}
                          className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                          onClick={() => handleSelectBook(book.provider_id)}
                        >
                          {book.image_url ? (
                            <img src={book.image_url} alt={book.name} className="h-10 w-7 object-cover" />
                          ) : (
                            <div className="h-10 w-7 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                              No img
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{book.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {book.artist && book.artist.length > 0 ? book.artist[0] : ''}
                              {book.published_on ? ` (${new Date(book.published_on).getFullYear()})` : ''}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {showBookResults && bookSearchResults.length === 0 && bookSearch.length >= 2 && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isSearchingBook ? "Loading..." : "No books found. Please try a different search or enter details manually."}
                    </p>
                  </div>
                )}
                <Input
                  type="hidden"
                  id="name"
                  {...register('name')}
                />
              </div>
            ) : currentArtType === 'music' ? (
              <div className="relative">
                <Input
                  id="musicSearch"
                  placeholder="Search for a song..."
                  value={musicSearch}
                  onChange={handleMusicSearchChange}
                  autoComplete="off"
                />
                {isSearchingMusic && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-slate-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
                {showMusicResults && musicSearchResults.length > 0 && (
                  <div 
                    ref={musicSearchResultsRef}
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg max-h-60 overflow-auto border border-slate-200 dark:border-slate-700"
                  >
                    <ul className="py-1">
                      {musicSearchResults.map((track) => (
                        <li 
                          key={track.provider_id}
                          className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                          onClick={() => handleSelectMusic(track.provider_id)}
                        >
                          {track.image_url ? (
                            <img src={track.image_url} alt={track.name} className="h-10 w-10 object-cover rounded-sm" />
                          ) : (
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs rounded-sm">
                              No img
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{track.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {track.artist && track.artist.length > 0 ? track.artist.join(', ') : 'Unknown Artist'}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {showMusicResults && musicSearchResults.length === 0 && musicSearch.length >= 2 && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isSearchingMusic ? "Loading..." : "No songs found. Please try a different search or enter details manually."}
                    </p>
                  </div>
                )}
                <Input
                  type="hidden"
                  id="name"
                  {...register('name')}
                />
              </div>
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
            <div className="space-y-2">
              <MultiInput
                inputs={tags}
                setInputs={setTags}
                currentInput={currentTag}
                setCurrentInput={setCurrentTag}
                placeholder="Add tags (press Enter after each tag)"
                maxInputs={5}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.from(tags).map((tag) => (
                  <div
                    key={tag}
                    className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTags((prev) => {
                          const newTags = new Set(prev);
                          newTags.delete(tag);
                          return newTags;
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Artist/Author field for all art types */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {currentArtType === 'movie' ? 'Director/Artist' : 'Artist/Author'}
            </label>
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
                placeholder={currentArtType === 'movie' ? "Add directors (press Enter after each name)" : "Add artists (press Enter after each name)"}
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
          </div>
          
          {/* Published date field for all art types */}
          <div>
            <label htmlFor="published_on" className="block text-sm font-medium mb-2">
              {currentArtType === 'movie' ? 'Release Date' : 'Published Date'}
            </label>
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
              placeholder={currentArtType === 'movie' ? "Release date" : "Publication date"}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={addArtMutation.isPending || !session}
              className="w-full cursor-pointer"
            >
              {addArtMutation.isPending ? 'Adding...' : 'Add Art'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}