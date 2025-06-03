// Helper function to format a date as YYYY-MM-DD for date inputs
export function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Function to extract YouTube video ID from various YouTube URL formats
export const extractYoutubeVideoId = (url: string): string | null => {
  // Regular expressions for different YouTube URL formats
  const regexPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/, // Standard and shortened URLs
    /youtube\.com\/embed\/([^?\s]+)/, // Embed URLs
    /youtube\.com\/v\/([^?\s]+)/, // Old embed URLs
    /music\.youtube\.com\/watch\?v=([^&\s]+)/ // YouTube Music URLs
  ];

  for (const pattern of regexPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};
