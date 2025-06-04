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

    // First check if the art exists
    const { data: art, error: fetchError } = await supabase
      .from("arts")
      .select("uuid")
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
    
    // Check if user has already upvoted using the new art_votes table
    const { data: existingVote, error: voteCheckError } = await supabase
      .from("art_votes")
      .select("id")
      .eq("art_id", uuid)
      .eq("user_id", userId)
      .maybeSingle();
      
    if (voteCheckError) {
      return NextResponse.json({ error: voteCheckError.message }, { status: 500 });
    }
    
    let result;
    
    if (existingVote) {
      // User already upvoted, remove upvote by deleting the row
      const { error: deleteError } = await supabase
        .from("art_votes")
        .delete()
        .eq("art_id", uuid)
        .eq("user_id", userId);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
      
      result = { upvoted: false };
    } else {
      // User has not upvoted, add upvote by inserting a new row
      const { error: insertError } = await supabase
        .from("art_votes")
        .insert({ 
          art_id: uuid,
          user_id: userId
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      
      result = { upvoted: true };
    }
    
    // Count total votes for this art piece
    const { count, error: countError } = await supabase
      .from("art_votes")
      .select("id", { count: "exact" })
      .eq("art_id", uuid);
      
    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }
    
    // Return the updated data
    return NextResponse.json({ 
      ...result,
      uuid,
      votes: count
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
