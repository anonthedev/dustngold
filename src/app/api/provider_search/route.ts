import { NextRequest, NextResponse } from "next/server";

interface ProviderSearchParams {
  query: string;
  type: "movie" | "book" | "music";
}

interface StandardizedResponse {
  name: string;
  artist: string[];
  published_on: string | null;
  description: string | null;
  image_url: string | null;
  url: string | null;
  tags: string[];
  provider_id: string;
  type: "movie" | "book" | "music";
  raw_data: any; // Original data from provider for debugging or additional fields
}

// Standardize OMDB movie response
function standardizeOMDBResponse(
  data: any
):
  | StandardizedResponse
  | { results: StandardizedResponse[]; totalResults: number } {
  // Handle multiple search results
  if (data.Search && Array.isArray(data.Search)) {
    return {
      results: data.Search.map((movie: any) => ({
        name: movie.Title || "",
        artist: [], // We don't have director in search results
        published_on: movie.Year
          ? new Date(`${movie.Year}-01-01`).toISOString()
          : null,
        description: null, // Not available in search results
        image_url: movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null,
        url: movie.imdbID ? `https://www.imdb.com/title/${movie.imdbID}` : null,
        tags: [], // Not available in search results
        provider_id: movie.imdbID || "",
        type: "movie",
        raw_data: movie,
      })),
      totalResults: data.totalResults || data.Search.length,
    };
  }

  // Handle single movie detail
  return {
    name: data.Title || "",
    artist:
      data.Director && data.Director !== "N/A" ? data.Director.split(", ") : [],
    published_on:
      data.Released && data.Released !== "N/A"
        ? new Date(data.Released).toISOString()
        : data.Year && data.Year !== "N/A"
        ? new Date(`${data.Year}-01-01`).toISOString()
        : null,
    description: data.Plot && data.Plot !== "N/A" ? data.Plot : null,
    image_url: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
    url: data.imdbID ? `https://www.imdb.com/title/${data.imdbID}` : null,
    tags: data.Genre && data.Genre !== "N/A" ? data.Genre.split(", ") : [],
    provider_id: data.imdbID || "",
    type: "movie",
    raw_data: data,
  };
}

// Standardize OpenLibrary book response
function standardizeOpenLibraryResponse(
  data: any
):
  | StandardizedResponse
  | { results: StandardizedResponse[]; totalResults: number } {
  // Handle multiple search results
  if (data.docs && Array.isArray(data.docs)) {
    return {
      results: data.docs.map((book: any) => {
        // Extract publication year, ensuring it's valid
        let publishedDate = null;
        if (book.first_publish_year) {
          try {
            publishedDate = new Date(
              `${book.first_publish_year}-01-01`
            ).toISOString();
          } catch (e) {
            console.error(
              "Error parsing publication year:",
              book.first_publish_year,
              e
            );
          }
        }

        return {
          name: book.title || "",
          artist: book.author_name || [],
          published_on: publishedDate,
          description: null, // Not available in search results
          image_url: book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : null,
          url: book.key ? `https://openlibrary.org${book.key}` : null,
          tags: book.subject
            ? Array.isArray(book.subject)
              ? book.subject.slice(0, 5)
              : [book.subject]
            : [],
          provider_id: book.key ? book.key.replace("/works/", "") : "",
          type: "book",
          raw_data: book,
        };
      }),
      totalResults: data.numFound || data.docs.length,
    };
  }

  // Handle single book detail (less common case as OpenLibrary primarily returns lists)
  // For book details, we need to extract author information from a different format
  let authors: string[] = [];
  if (data.authors && Array.isArray(data.authors)) {
    // Try to extract author names from search result format first
    if (data.author_name && Array.isArray(data.author_name)) {
      authors = data.author_name.filter(Boolean);
    }
    // Then try the detailed book format
    else {
      // For detailed responses, author info is in a nested structure
      const authorData = data.authors
        .filter(
          (authorEntry: any) =>
            authorEntry &&
            (authorEntry.name || (authorEntry.author && authorEntry.author.key))
        )
        .map((authorEntry: any) => {
          // If we have the author name directly (already enriched in getOpenLibraryBookDetails)
          if (authorEntry.name) {
            return authorEntry.name;
          }
          return null;
        })
        .filter(Boolean);

      // If we have author data, use it
      if (authorData.length > 0) {
        authors = authorData;
      }
    }
  }

  // Extract publication year or date from various possible sources
  let publishedDate = null;

  // Try different date sources in order of preference
  if (data.first_publish_date) {
    try {
      publishedDate = new Date(data.first_publish_date).toISOString();
    } catch (e) {
      console.error(
        "Error parsing first_publish_date:",
        data.first_publish_date,
        e
      );
    }
  } else if (data.publish_date) {
    try {
      publishedDate = new Date(data.publish_date).toISOString();
    } catch (e) {
      console.error("Error parsing publish_date:", data.publish_date, e);
    }
  }
  // Look in raw_data for publication year
  else if (data.created && data.created.value) {
    try {
      publishedDate = new Date(data.created.value).toISOString();
    } catch (e) {
      console.error("Error parsing created date:", data.created.value, e);
    }
  }
  // Last resort - if we have a last_modified date
  else if (data.last_modified && data.last_modified.value) {
    try {
      publishedDate = new Date(data.last_modified.value).toISOString();
    } catch (e) {
      console.error(
        "Error parsing last_modified date:",
        data.last_modified.value,
        e
      );
    }
  }

  return {
    name: data.title || "",
    artist: authors,
    published_on: publishedDate,
    description: data.description
      ? typeof data.description === "string"
        ? data.description
        : data.description.value
      : null,
    image_url:
      data.covers && data.covers.length > 0
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg`
        : null,
    url: data.key ? `https://openlibrary.org${data.key}` : null,
    tags: data.subjects ? data.subjects.slice(0, 5) : [],
    provider_id: data.key ? data.key.replace("/works/", "") : "",
    type: "book",
    raw_data: data,
  };
}

// Search OMDB API for movies
async function searchOMDB(query: string): Promise<any> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    throw new Error("OMDB API key not configured");
  }

  const response = await fetch(
    `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(
      query
    )}&type=movie`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch from OMDB API");
  }

  const data = await response.json();

  if (data.Response === "False") {
    throw new Error(data.Error || "No results found");
  }

  return data;
}

// Get detailed OMDB movie info by ID
async function getOMDBMovieDetails(imdbID: string): Promise<any> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    throw new Error("OMDB API key not configured");
  }

  const response = await fetch(
    `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch from OMDB API");
  }

  const data = await response.json();

  if (data.Response === "False") {
    throw new Error(data.Error || "Movie not found");
  }

  return data;
}

// Search OpenLibrary API for books
async function searchOpenLibrary(query: string): Promise<any> {
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch from OpenLibrary API");
  }

  const data = await response.json();

  if (!data.docs || data.docs.length === 0) {
    throw new Error("No books found");
  }

  return data;
}

// Get author details from OpenLibrary
async function getOpenLibraryAuthorDetails(authorId: string): Promise<any> {
  try {
    const response = await fetch(
      `https://openlibrary.org/authors/${authorId}.json`
    );

    if (!response.ok) {
      console.error(`Failed to fetch author details for ${authorId}`);
      return null;
    }

    const data = await response.json();
    return data.name ? data.name : null;
  } catch (error) {
    console.error(`Error fetching author ${authorId}:`, error);
    return null;
  }
}

// Get detailed OpenLibrary book info by ID
async function getOpenLibraryBookDetails(workId: string): Promise<any> {
  const response = await fetch(`https://openlibrary.org/works/${workId}.json`);

  if (!response.ok) {
    throw new Error("Failed to fetch book details from OpenLibrary API");
  }

  const data = await response.json();

  // Enhance data with author names when necessary
  if (data.authors && Array.isArray(data.authors)) {
    const authorPromises = data.authors.map(async (authorEntry: any) => {
      if (authorEntry.author && authorEntry.author.key) {
        const authorId = authorEntry.author.key.split("/").pop();
        if (authorId) {
          const authorName = await getOpenLibraryAuthorDetails(authorId);
          if (authorName) {
            return { ...authorEntry, name: authorName };
          }
        }
      }
      return authorEntry;
    });

    data.authors = await Promise.all(authorPromises);
  }

  return data;
}

// Standardize Last.fm track response
function standardizeLastFmResponse(
  data: any
):
  | StandardizedResponse
  | { results: StandardizedResponse[]; totalResults: number } {
  // Handle search results
  if (
    data.results &&
    data.results.trackmatches &&
    data.results.trackmatches.track
  ) {
    const tracks = Array.isArray(data.results.trackmatches.track)
      ? data.results.trackmatches.track
      : [data.results.trackmatches.track];

    return {
      results: tracks.map((track: any) => ({
        name: track.name || "",
        artist: track.artist ? [track.artist] : [],
        published_on: null, // Not available in search results
        description: null, // Not available in search results
        image_url:
          track.image && track.image.length > 0
            ? track.image.find(
                (img: any) => img.size === "extralarge" || img.size === "large" || img.size === "medium"
              )?.["#text"] || null
            : null,
        url: track.url || null,
        tags: [], // Not available in search results
        provider_id: `${track.artist}:${track.name}`, // Composite ID of artist:track
        type: "music",
        raw_data: track,
      })),
      totalResults: parseInt(
        data.results["opensearch:totalResults"] || tracks.length,
        10
      ),
    };
  }

  // Handle single track detail
  if (data.track) {
    const track = data.track;
    const tags = [];

    // Extract tags if available
    if (track.toptags && track.toptags.tag) {
      const trackTags = Array.isArray(track.toptags.tag)
        ? track.toptags.tag
        : [track.toptags.tag];
      tags.push(...trackTags.map((tag: any) => tag.name).slice(0, 5));
    }

    // Get the album image if available
    let imageUrl = null;
    if (track.album && track.album.image && track.album.image.length > 0) {
      const largeImage = track.album.image.find(
        (img: any) => img.size === "large" || img.size === "medium"
      );
      imageUrl = largeImage ? largeImage["#text"] : null;
    }

    // Get publication date from track or album if available
    let publishedDate = null;
    if (track.wiki && track.wiki.published) {
      try {
        publishedDate = new Date(track.wiki.published).toISOString();
      } catch (e) {
        console.error("Error parsing published date:", track.wiki.published, e);
      }
    }

    // Create description from wiki content if available
    const description =
      track.wiki && track.wiki.content ? track.wiki.content : null;

    return {
      name: track.name || "",
      artist: track.artist
        ? typeof track.artist === "string"
          ? [track.artist]
          : [track.artist.name]
        : [],
      published_on: publishedDate,
      description: description,
      image_url: imageUrl,
      url: track.url || null,
      tags: tags,
      provider_id: `${track.artist.name || track.artist}:${track.name}`,
      type: "music",
      raw_data: track,
    };
  }

  throw new Error("Invalid Last.fm data format");
}

// Search Last.fm API for tracks
async function searchLastFm(query: string): Promise<any> {
  const apiKey = process.env.LASTFM_API_KEY;

  const response = await fetch(
    `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(
      query
    )}&api_key=${apiKey}&format=json`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch from Last.fm API");
  }

  const data = await response.json();

  if (
    !data.results ||
    !data.results.trackmatches ||
    !data.results.trackmatches.track ||
    (Array.isArray(data.results.trackmatches.track) &&
      data.results.trackmatches.track.length === 0)
  ) {
    throw new Error("No tracks found");
  }

  return data;
}

// Get detailed Last.fm track info
async function getLastFmTrackDetails(
  artist: string,
  track: string
): Promise<any> {
  const apiKey = process.env.LASTFM_API_KEY; // Using the provided key as fallback

  const response = await fetch(
    `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(
      artist
    )}&track=${encodeURIComponent(track)}&format=json`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch track details from Last.fm API");
  }

  const data = await response.json();

  if (!data.track) {
    throw new Error("Track not found");
  }

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const type = searchParams.get("type") as "movie" | "book" | "music";
    const id = searchParams.get("id"); // Optional: for fetching details of a specific item

    if (!query && !id) {
      return NextResponse.json(
        { error: "Query or ID is required" },
        { status: 400 }
      );
    }

    if (!type || (type !== "movie" && type !== "book" && type !== "music")) {
      return NextResponse.json(
        { error: "Valid type (movie, book, or music) is required" },
        { status: 400 }
      );
    }

    // For movie details by ID
    if (id && type === "movie") {
      const data = await getOMDBMovieDetails(id);
      return NextResponse.json(standardizeOMDBResponse(data));
    }

    // For book details by ID
    if (id && type === "book") {
      const data = await getOpenLibraryBookDetails(id);
      return NextResponse.json(standardizeOpenLibraryResponse(data));
    }

    // For music details by composite ID (artist:track)
    if (id && type === "music") {
      const [artist, track] = id.split(":");
      if (artist && track) {
        const data = await getLastFmTrackDetails(artist, track);
        return NextResponse.json(standardizeLastFmResponse(data));
      } else {
        return NextResponse.json(
          { error: "Invalid track ID format" },
          { status: 400 }
        );
      }
    }

    // For search queries without ID
    if (query) {
      if (type === "movie") {
        const data = await searchOMDB(query);
        return NextResponse.json(standardizeOMDBResponse(data));
      } else if (type === "book") {
        const data = await searchOpenLibrary(query);
        return NextResponse.json(standardizeOpenLibraryResponse(data));
      } else if (type === "music") {
        const data = await searchLastFm(query);
        return NextResponse.json(standardizeLastFmResponse(data));
      }
    }

    return NextResponse.json(
      { error: "Invalid request parameters" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Provider search error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
