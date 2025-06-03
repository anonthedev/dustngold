import { NextRequest, NextResponse } from "next/server";

interface OEmbedResponse {
  type: string;
  version: string;
  title: string;
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  html: string;
  width: number;
  height: number;
}

// Function to get additional video data using web scraping techniques
async function getAdditionalVideoData(videoId: string) {
  try {
    // Fetch the YouTube watch page to extract more metadata
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Extract upload date using a simple regex pattern
    // This is a basic implementation and might need adjustments based on YouTube's HTML structure
    let publishedAt = null;
    const dateMatch = html.match(/"dateText":\{"simpleText":"([^"]+)"\}/);
    if (dateMatch && dateMatch[1]) {
      // Convert to ISO date format if possible
      try {
        publishedAt = new Date(dateMatch[1]).toISOString();
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }
    
    // Extract tags if available
    const tags: string[] = [];
    const tagsMatch = html.match(/"keywords":\[([^\]]+)\]/);
    if (tagsMatch && tagsMatch[1]) {
      const tagString = tagsMatch[1];
      // Parse the comma-separated quoted strings
      const tagMatches = tagString.match(/"([^"]+)"/g);
      if (tagMatches) {
        tagMatches.slice(0, 5).forEach(tag => {
          // Remove the quotes
          tags.push(tag.replace(/"/g, ''));
        });
      }
    }
    
    // Extract description if available
    let description = null;
    const descMatch = html.match(/"description":\{"simpleText":"([^"]+)"\}/);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].replace(/\\n/g, '\n');
    }
    
    return {
      publishedAt,
      tags,
      description
    };
  } catch (error) {
    console.error('Error fetching additional video data:', error);
    return {
      publishedAt: null,
      tags: [],
      description: null
    };
  }
}

// YouTube API endpoint to fetch video details using oEmbed
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Missing videoId parameter" },
        { status: 400 }
      );
    }

    // Construct the YouTube video URL
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Fetch video data from YouTube oEmbed API (no API key required)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error(`YouTube oEmbed API error: ${response.status}`);
    }

    const oembedData: OEmbedResponse = await response.json();
    
    // Get additional data that's not available through oEmbed
    const additionalData = await getAdditionalVideoData(videoId);
    
    // Format the response to match the structure expected by the frontend
    const formattedData = {
      items: [
        {
          id: videoId,
          snippet: {
            title: oembedData.title,
            description: additionalData.description || '',
            channelTitle: oembedData.author_name,
            channelId: oembedData.author_url.split('/').pop(),
            publishedAt: additionalData.publishedAt || new Date().toISOString(), // Fallback to current date if not found
            thumbnails: {
              default: { url: oembedData.thumbnail_url },
              medium: { url: oembedData.thumbnail_url },
              high: { url: oembedData.thumbnail_url.replace('/hqdefault.jpg', '/maxresdefault.jpg') }
            },
            tags: additionalData.tags
          },
          contentDetails: {
            duration: 'PT0M0S' // Default duration format
          }
        }
      ]
    };
    // Return the formatted data
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}
