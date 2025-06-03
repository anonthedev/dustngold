import { useRef, useEffect } from 'react';
import { useArtFormStore } from '@/lib/stores/art-form-store';
import { useProviderSearch } from '@/lib/hooks/use-art-queries';

interface SearchResultsProps {
  type: 'movie' | 'book' | 'music';
  setValue: any;
}

export function SearchResults({ type, setValue }: SearchResultsProps) {
  const {
    movieSearchResults,
    bookSearchResults,
    musicSearchResults,
    showMovieResults,
    showBookResults,
    showMusicResults,
    isSearchingMovie,
    isSearchingBook,
    isSearchingMusic,
    movieSearch,
    bookSearch,
    musicSearch,
    setShowMovieResults,
    setShowBookResults,
    setShowMusicResults
  } = useArtFormStore();
  
  const { handleSelect } = useProviderSearch(type, setValue);
  
  const movieSearchResultsRef = useRef<HTMLDivElement>(null);
  const bookSearchResultsRef = useRef<HTMLDivElement>(null);
  const musicSearchResultsRef = useRef<HTMLDivElement>(null);

  // Handle closing the search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (type === 'movie' && movieSearchResultsRef.current && !movieSearchResultsRef.current.contains(event.target as Node)) {
        setShowMovieResults(false);
      }
      
      if (type === 'book' && bookSearchResultsRef.current && !bookSearchResultsRef.current.contains(event.target as Node)) {
        setShowBookResults(false);
      }
      
      if (type === 'music' && musicSearchResultsRef.current && !musicSearchResultsRef.current.contains(event.target as Node)) {
        setShowMusicResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [type, setShowMovieResults, setShowBookResults, setShowMusicResults]);

  // Determine the correct search results, loading state, and visibility based on type
  const searchResults = type === 'movie' 
    ? movieSearchResults 
    : type === 'book' 
      ? bookSearchResults 
      : musicSearchResults;
  
  const isSearching = type === 'movie' 
    ? isSearchingMovie 
    : type === 'book' 
      ? isSearchingBook 
      : isSearchingMusic;
  
  const showResults = type === 'movie' 
    ? showMovieResults 
    : type === 'book' 
      ? showBookResults 
      : showMusicResults;
  
  const searchText = type === 'movie' 
    ? movieSearch 
    : type === 'book' 
      ? bookSearch 
      : musicSearch;
  
  const resultRef = type === 'movie' 
    ? movieSearchResultsRef 
    : type === 'book' 
      ? bookSearchResultsRef 
      : musicSearchResultsRef;

  // If no results to show, return null
  if (!showResults) {
    return null;
  }

  return (
    <>
      {searchResults.length > 0 ? (
        <div 
          ref={resultRef}
          className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg max-h-60 overflow-auto border border-slate-200 dark:border-slate-700"
        >
          <ul className="py-1">
            {searchResults.map((item) => (
              <li 
                key={item.provider_id}
                className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                onClick={() => handleSelect(item.provider_id)}
              >
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className={type === 'music' ? "h-10 w-10 object-cover rounded-sm" : "h-10 w-7 object-cover"} 
                  />
                ) : (
                  <div className={type === 'music' 
                    ? "h-10 w-10 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs rounded-sm" 
                    : "h-10 w-7 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs"
                  }>
                    No img
                  </div>
                )}
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {type === 'book' && item.artist && item.artist.length > 0 ? item.artist[0] : ''}
                    {type === 'music' && item.artist && item.artist.length > 0 ? item.artist.join(', ') : ''}
                    {item.published_on ? 
                      type === 'book' 
                        ? ` (${new Date(item.published_on).getFullYear()})` 
                        : ` ${new Date(item.published_on).getFullYear()}` 
                      : ''}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        searchText.length >= 2 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isSearching 
                ? "Loading..." 
                : `No ${type}s found. Please try a different search or enter details manually.`}
            </p>
          </div>
        )
      )}
    </>
  );
}
