import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

// GET - Retrieve all arts with flexible filtering options
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const username = searchParams.get('username'); // filter by username
  const profile = searchParams.get('profile') === 'true'; // get current user's arts
  
  // Get session to access the token
  const session = await getServerSession(authOptions);
  
  // Create Supabase client with access token if available
  // Otherwise use a server-side only client for public data
  const supabase = session?.supabaseAccessToken 
    ? supabaseClient(session.supabaseAccessToken)
    : supabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY || ''); // Use service role for public data
  
  try {
    let userId: string | undefined = undefined;
    let userInfo: { name?: string; image?: string | null } | null = null;
    
    // If requesting a specific user's arts by username
    if (username) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, image')
        .eq('username', username)
        .single();
      
      if (userError || !userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      userId = userData.id;
      userInfo = {
        name: userData.name,
        image: userData.image,
      };
    }
    // If requesting current user's arts (profile)
    else if (profile && session?.user?.id) {
      userId = session.user.id;
    }
    
    // Build the query based on provided filters
    let query = supabase
      .from('arts')
      .select('*')
      .order("created_at", { ascending: false });
      
    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    
    if (userId) {
      query = query.eq('submitted_by', userId);
    }
    
    const { data: arts, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!arts || arts.length === 0) {
      return NextResponse.json(username ? { user: userInfo, arts: [] } : []);
    }
    
    // Fetch votes with user information for all arts
    const { data:votes, error:votesError } = await supabase
    .from('art_votes')
    .select('art_id, user_id, public_users:user_id(id, name, username, image)')
    .in('art_id', arts.map(art => art.uuid));
  
      
    console.log(votes)

    if (votesError) {
      return NextResponse.json({ error: votesError.message }, { status: 500 });
    }
    
    // Count the votes for each art piece and collect upvoter information
    const voteCounts: Record<string, number> = {};
    const upvoters: Record<string, Array<{id: string, name: string, username: string, image: string | null}>> = {};
    
    votes?.forEach(vote => {
      voteCounts[vote.art_id] = (voteCounts[vote.art_id] || 0) + 1;
      
      // Initialize upvoters array for this art if it doesn't exist
      if (!upvoters[vote.art_id]) {
        upvoters[vote.art_id] = [];
      }
      
      // Add upvoter info if available
      if (vote.public_users) {
        // Type assertion for the nested join result
        const userData = vote.public_users as unknown as {
          id: string;
          name: string;
          username: string;
          image: string | null;
        };
        
        upvoters[vote.art_id].push({
          id: userData.id,
          name: userData.name,
          username: userData.username,
          image: userData.image
        });
      }
    });
    
    // For logged-in users, check which arts they've upvoted
    let userVotes: string[] = [];
    if (session?.user?.id) {
      const { data: userVotesData } = await supabase
        .from('art_votes')
        .select('art_id')
        .eq('user_id', session.user.id);
      
      if (userVotesData) {
        userVotes = userVotesData.map(vote => vote.art_id);
      }
    }
    
    // Update arts with vote counts and upvoter information
    const artsWithVotes = arts.map(art => ({
      ...art,
      votes: voteCounts[art.uuid] || 0,
      upvoters: upvoters[art.uuid] || []
    }));
    
    // Return format depends on the request type
    if (username) {
      return NextResponse.json({
        user: userInfo,
        arts: artsWithVotes
      });
    } else {
      return NextResponse.json(artsWithVotes);
    }
  } catch (e) {
    console.error('Error fetching arts:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
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

    const { data, error } = await supabase
      .from('arts')
      .insert({
        type: body.type,
        name: body.name,
        url: body.url || null,
        provider_id: body.provider_id || null,
        description: body.description,
        image_url: body.image_url || null,
        submitted_by: session.user.id,
        tags: body.tags || [],
        artist: body.artist || null,
        published_on: body.published_on || null
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
