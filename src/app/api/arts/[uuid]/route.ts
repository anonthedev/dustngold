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

  const session = await getServerSession(authOptions);

  const supabase = session?.supabaseAccessToken
    ? supabaseClient(session.supabaseAccessToken)
    : supabaseClient("");

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

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const supabase = supabaseClient(session.supabaseAccessToken);

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

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseClient(session.supabaseAccessToken);

  try {
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
