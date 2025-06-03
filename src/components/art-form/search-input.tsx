import { Input } from '@/components/ui/input';
import { useArtFormStore } from '@/lib/stores/art-form-store';
import { SearchResults } from './search-results';
import { useCallback } from 'react';
import debounce from 'lodash.debounce';

interface SearchInputProps {
  type: 'movie' | 'book' | 'music';
  register: any;
  setValue: any;
}

export function SearchInput({ type, register, setValue }: SearchInputProps) {
  const {
    movieSearch,
    bookSearch,
    musicSearch,
    isSearchingMovie,
    isSearchingBook,
    isSearchingMusic,
    setMovieSearch,
    setBookSearch,
    setMusicSearch,
    setIsSearchingMovie,
    setIsSearchingBook,
    setIsSearchingMusic,
    setShowMovieResults,
    setShowBookResults,
    setShowMusicResults,
    setMovieSearchResults,
    setBookSearchResults,
    setMusicSearchResults,
  } = useArtFormStore();

  // Debounced search function for each type
  const debouncedSearch = useCallback(
    debounce(async (query: string, searchType: 'movie' | 'book' | 'music') => {
      if (query.length < 2) {
        if (searchType === 'movie') {
          setMovieSearchResults([]);
          setIsSearchingMovie(false);
        } else if (searchType === 'book') {
          setBookSearchResults([]);
          setIsSearchingBook(false);
        } else {
          setMusicSearchResults([]);
          setIsSearchingMusic(false);
        }
        return;
      }

      try {
        const response = await fetch(`/api/provider_search?query=${encodeURIComponent(query)}&type=${searchType}`);
        const data = await response.json();
        
        if (response.ok && data.results) {
          if (searchType === 'movie') {
            setMovieSearchResults(data.results);
          } else if (searchType === 'book') {
            setBookSearchResults(data.results);
          } else {
            setMusicSearchResults(data.results);
          }
        } else {
          if (searchType === 'movie') {
            setMovieSearchResults([]);
          } else if (searchType === 'book') {
            setBookSearchResults([]);
          } else {
            setMusicSearchResults([]);
          }
        }
      } catch (error) {
        console.error(`Error searching ${searchType}s:`, error);
        if (searchType === 'movie') {
          setMovieSearchResults([]);
        } else if (searchType === 'book') {
          setBookSearchResults([]);
        } else {
          setMusicSearchResults([]);
        }
      } finally {
        if (searchType === 'movie') {
          setIsSearchingMovie(false);
        } else if (searchType === 'book') {
          setIsSearchingBook(false);
        } else {
          setIsSearchingMusic(false);
        }
      }
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    
    if (type === 'movie') {
      setMovieSearch(query);
      
      if (query.length >= 2) {
        setIsSearchingMovie(true);
        setShowMovieResults(true);
        debouncedSearch(query, 'movie');
      } else {
        setMovieSearchResults([]);
        setShowMovieResults(false);
      }
    } else if (type === 'book') {
      setBookSearch(query);
      
      if (query.length >= 2) {
        setIsSearchingBook(true);
        setShowBookResults(true);
        debouncedSearch(query, 'book');
      } else {
        setBookSearchResults([]);
        setShowBookResults(false);
      }
    } else {
      setMusicSearch(query);
      
      if (query.length >= 2) {
        setIsSearchingMusic(true);
        setShowMusicResults(true);
        debouncedSearch(query, 'music');
      } else {
        setMusicSearchResults([]);
        setShowMusicResults(false);
      }
    }
  };

  // Get the appropriate value based on type
  const value = type === 'movie' 
    ? movieSearch 
    : type === 'book' 
      ? bookSearch 
      : musicSearch;
  
  // Get the appropriate loading state based on type
  const isSearching = type === 'movie' 
    ? isSearchingMovie 
    : type === 'book' 
      ? isSearchingBook 
      : isSearchingMusic;
  
  // Get the appropriate placeholder based on type
  const placeholder = type === 'movie' 
    ? "Search for a movie..." 
    : type === 'book' 
      ? "Search for a book..." 
      : "Search for a song...";

  return (
    <div className="relative">
      <Input
        id={`${type}Search`}
        placeholder={placeholder}
        value={value}
        onChange={handleSearchChange}
        autoComplete="off"
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-slate-500 rounded-full border-t-transparent"></div>
        </div>
      )}
      <SearchResults type={type} setValue={setValue} />
      <Input
        type="hidden"
        id="name"
        {...register('name')}
      />
    </div>
  );
}
