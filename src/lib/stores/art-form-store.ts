import { create } from "zustand";
import { Art, ArtType } from "@/lib/store";

export interface ArtFormState {
  // Form data
  tags: Set<string>;
  artists: Set<string>;
  currentTag: string;
  currentArtist: string;
  publishedDateStr: string;
  
  // Movie search state
  movieSearch: string;
  movieSearchResults: any[];
  showMovieResults: boolean;
  isSearchingMovie: boolean;
  selectedMovie: any | null;
  
  // Book search state
  bookSearch: string;
  bookSearchResults: any[];
  showBookResults: boolean;
  isSearchingBook: boolean;
  selectedBook: any | null;
  
  // Music search state
  musicSearch: string;
  musicSearchResults: any[];
  showMusicResults: boolean;
  isSearchingMusic: boolean;
  selectedMusic: any | null;
  
  // YouTube loading state
  isLoadingYoutubeData: boolean;
  
  // Actions
  setTags: (tags: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setArtists: (artists: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setCurrentTag: (tag: string) => void;
  setCurrentArtist: (artist: string) => void;
  setPublishedDateStr: (date: string) => void;
  
  // Movie search actions
  setMovieSearch: (search: string) => void;
  setMovieSearchResults: (results: any[]) => void;
  setShowMovieResults: (show: boolean) => void;
  setIsSearchingMovie: (isSearching: boolean) => void;
  setSelectedMovie: (movie: any | null) => void;
  
  // Book search actions
  setBookSearch: (search: string) => void;
  setBookSearchResults: (results: any[]) => void;
  setShowBookResults: (show: boolean) => void;
  setIsSearchingBook: (isSearching: boolean) => void;
  setSelectedBook: (book: any | null) => void;
  
  // Music search actions
  setMusicSearch: (search: string) => void;
  setMusicSearchResults: (results: any[]) => void;
  setShowMusicResults: (show: boolean) => void;
  setIsSearchingMusic: (isSearching: boolean) => void;
  setSelectedMusic: (music: any | null) => void;
  
  // YouTube loading actions
  setIsLoadingYoutubeData: (isLoading: boolean) => void;
  
  // Reset state for type change
  resetFormForTypeChange: () => void;
}

export const useArtFormStore = create<ArtFormState>((set) => ({
  // Form data
  tags: new Set<string>(),
  artists: new Set<string>(),
  currentTag: '',
  currentArtist: '',
  publishedDateStr: '',
  
  // Movie search state
  movieSearch: '',
  movieSearchResults: [],
  showMovieResults: false,
  isSearchingMovie: false,
  selectedMovie: null,
  
  // Book search state
  bookSearch: '',
  bookSearchResults: [],
  showBookResults: false,
  isSearchingBook: false,
  selectedBook: null,
  
  // Music search state
  musicSearch: '',
  musicSearchResults: [],
  showMusicResults: false,
  isSearchingMusic: false,
  selectedMusic: null,
  
  // YouTube loading state
  isLoadingYoutubeData: false,
  
  // Actions
  setTags: (tagsOrUpdater) => set(state => {
    if (typeof tagsOrUpdater === 'function') {
      return { tags: tagsOrUpdater(state.tags) };
    }
    return { tags: tagsOrUpdater };
  }),
  setArtists: (artistsOrUpdater) => set(state => {
    if (typeof artistsOrUpdater === 'function') {
      return { artists: artistsOrUpdater(state.artists) };
    }
    return { artists: artistsOrUpdater };
  }),
  setCurrentTag: (tag) => set({ currentTag: tag }),
  setCurrentArtist: (artist) => set({ currentArtist: artist }),
  setPublishedDateStr: (date) => set({ publishedDateStr: date }),
  
  // Movie search actions
  setMovieSearch: (search) => set({ movieSearch: search }),
  setMovieSearchResults: (results) => set({ movieSearchResults: results }),
  setShowMovieResults: (show) => set({ showMovieResults: show }),
  setIsSearchingMovie: (isSearching) => set({ isSearchingMovie: isSearching }),
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  
  // Book search actions
  setBookSearch: (search) => set({ bookSearch: search }),
  setBookSearchResults: (results) => set({ bookSearchResults: results }),
  setShowBookResults: (show) => set({ showBookResults: show }),
  setIsSearchingBook: (isSearching) => set({ isSearchingBook: isSearching }),
  setSelectedBook: (book) => set({ selectedBook: book }),
  
  // Music search actions
  setMusicSearch: (search) => set({ musicSearch: search }),
  setMusicSearchResults: (results) => set({ musicSearchResults: results }),
  setShowMusicResults: (show) => set({ showMusicResults: show }),
  setIsSearchingMusic: (isSearching) => set({ isSearchingMusic: isSearching }),
  setSelectedMusic: (music) => set({ selectedMusic: music }),
  
  // YouTube loading actions
  setIsLoadingYoutubeData: (isLoading) => set({ isLoadingYoutubeData: isLoading }),
  
  // Reset state for type change
  resetFormForTypeChange: () => set({
    tags: new Set<string>(),
    artists: new Set<string>(),
    publishedDateStr: '',
    
    movieSearch: '',
    movieSearchResults: [],
    showMovieResults: false,
    selectedMovie: null,
    
    bookSearch: '',
    bookSearchResults: [],
    showBookResults: false,
    selectedBook: null,
    
    musicSearch: '',
    musicSearchResults: [],
    showMusicResults: false,
    selectedMusic: null,
  }),
}));
