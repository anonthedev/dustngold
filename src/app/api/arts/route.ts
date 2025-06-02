import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

// GET - Retrieve all arts or filter by type
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  
  // Get session to access the token
  const session = await getServerSession(authOptions);
  
  // Create Supabase client with access token if available
  // Otherwise use a server-side only client for public data
  const supabase = session?.supabaseAccessToken 
    ? supabaseClient(session.supabaseAccessToken)
    : supabaseClient(''); // For public data, pass empty string
  
  let query = supabase
    .from('arts')
    .select('*')
    .order("created_at", { ascending: false });
    
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST - Create a new art
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the current user from next-auth session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.supabaseAccessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Create Supabase client with the user's access token
    const supabase = supabaseClient(session.supabaseAccessToken);
    
    // Use the artist and published_on fields directly from the form submission
    // The form already handles setting these fields appropriately for different art types
    
    // Insert the new art
    const { data, error } = await supabase
      .from('arts')
      .insert({
        type: body.type,
        name: body.name,
        url: body.url || null,
        votes: 0,
        provider_id: body.provider_id || null,
        description: body.description,
        image_url: body.image_url || null,
        submitted_by: session.user.id,
        tags: body.tags || [],
        artist: body.artist || null,
        published_on: body.published_on || null,
        upvoted_by: []
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
