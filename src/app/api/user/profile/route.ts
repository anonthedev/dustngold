import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

// GET - Get user profile information
export async function GET(request: NextRequest) {
  // Get session to access the token
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create Supabase client with the user's access token
  const supabase = supabaseClient(session.supabaseAccessToken);

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
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

// PUT - Update user profile information
export async function PUT(request: NextRequest) {
  // Get session to access the token
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate username
    if (
      !body.username ||
      typeof body.username !== "string" ||
      body.username.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    if (body.username.length < 3 || body.username.length > 20) {
      return NextResponse.json(
        { error: "Username must be between 3 and 20 characters" },
        { status: 400 }
      );
    }

    if (
      body.username === "add" ||
      body.username === "profile" ||
      body.username === "dashboard" ||
      body.username === "arts" ||
      body.username === "omdb" ||
      body.username === "lastfm" ||
      body.username === "login" ||
      body.username === "register" ||
      body.username === "signup" ||
      body.username === "search" ||
      body.username === "logout" ||
      body.username === "api" ||
      body.username === "favicon.ico" ||
      body.username === "robots.txt" ||
      body.username === "edit" ||
      body.username === "delete" ||
      body.username === "update" ||
      body.username === "upvote" ||
      body.username === "downvote" ||
      body.username === "upvotes" ||
      body.username === "downvotes" ||
      body.username === "upvoted" ||
      body.username === "downvoted" ||
      body.username === "upvoters" ||
      body.username === "downvoters" ||
      body.username === "art_votes" ||
      body.username === "downvoted_by"
    ) {
      return NextResponse.json(
        { error: "Username is reserved" },
        { status: 400 }
      );
    }

    // Create Supabase client with the user's access token
    const supabase = supabaseClient(session.supabaseAccessToken);

    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("username", body.username)
      .neq("id", session.user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is what we want
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Update the user profile
    const { data, error } = await supabase
      .from("users")
      .update({ username: body.username })
      .eq("id", session.user.id)
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
