import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}&type=movie`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from OMDB API');
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      return NextResponse.json({ error: data.Error || 'No results found' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imdbID } = await request.json();
    
    if (!imdbID) {
      return NextResponse.json({ error: 'IMDB ID is required' }, { status: 400 });
    }
    
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from OMDB API');
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      return NextResponse.json({ error: data.Error || 'Movie not found' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
