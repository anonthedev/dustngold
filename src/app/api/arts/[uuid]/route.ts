import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

// GET - Retrieve a specific art by uuid
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const uuid = (await params).uuid;

  // Get session to access the token
  const session = await getServerSession(authOptions);

  // Create Supabase client with access token if available
  // Otherwise use a server-side only client for public data
  const supabase = session?.supabaseAccessToken
    ? supabaseClient(session.supabaseAccessToken)
    : supabaseClient(""); // For public data, pass empty string

  try {
    const { data, error } = await supabase
      .from("arts")
      .select("*")
      .eq("uuid", uuid)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Art not found" }, { status: 404 });
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

// PUT - Update an existing art
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const uuid = (await params).uuid;

  // Get session to access the token
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Create Supabase client with the user's access token
    const supabase = supabaseClient(session.supabaseAccessToken);

    // First check if the art exists and belongs to the user
    const { data: existingArt, error: checkError } = await supabase
      .from("arts")
      .select("submitted_by")
      .eq("uuid", uuid)
      .single();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (!existingArt) {
      return NextResponse.json({ error: "Art not found" }, { status: 404 });
    }

    // Ensure the user is the owner of the art
    if (existingArt.submitted_by !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the art
    const { data, error } = await supabase
      .from("arts")
      .update({
        name: body.name,
        description: body.description,
        url: body.url || null,
        image_url: body.image_url || null,
        tags: body.tags || [],
        artist: body.artist || null,
        published_on: body.published_on || null,
        submitted_by: session.user.id,
        // Don't update these fields:
        // type, votes, provider_id, submitted_by
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

// DELETE - Delete an art
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const uuid = (await params).uuid;

  // Get session to access the token
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create Supabase client with the user's access token
  const supabase = supabaseClient(session.supabaseAccessToken);

  try {
    // First check if the art exists and belongs to the user
    const { data: existingArt, error: checkError } = await supabase
      .from("arts")
      .select("submitted_by")
      .eq("uuid", uuid)
      .single();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (!existingArt) {
      return NextResponse.json({ error: "Art not found" }, { status: 404 });
    }

    // Ensure the user is the owner of the art
    if (existingArt.submitted_by !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the art
    const { error } = await supabase.from("arts").delete().eq("uuid", uuid);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
