import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest,{ params }: { params: Promise<{ uuid: string }> }) {
  try {
    const uuid = (await params).uuid;

    // Get the current user from next-auth session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.supabaseAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client with the user's access token
    const supabase = supabaseClient(session.supabaseAccessToken);

    // First get the current art
    const { data: art, error: fetchError } = await supabase
      .from("arts")
      .select("*")
      .eq("uuid", uuid)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!art) {
      return NextResponse.json({ error: "Art not found" }, { status: 404 });
    }

    // Get current user's ID
    const userId = session.user.id;
    
    // Initialize upvoted_by as an array if it doesn't exist
    const upvotedBy = art.upvoted_by || [];
    
    // Check if user has already upvoted
    const hasUpvoted = upvotedBy.includes(userId);
    
    let updatedUpvotedBy;
    let updatedVotes;
    
    if (hasUpvoted) {
      // User already upvoted, remove upvote
      updatedUpvotedBy = upvotedBy.filter((id: string) => id !== userId);
      updatedVotes = art.votes - 1;
    } else {
      // User has not upvoted, add upvote
      updatedUpvotedBy = [...upvotedBy, userId];
      updatedVotes = art.votes + 1;
    }

    // Update the votes and upvoted_by array
    const { data, error } = await supabase
      .from("arts")
      .update({ 
        votes: updatedVotes,
        upvoted_by: updatedUpvotedBy 
      })
      .eq("uuid", uuid)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
