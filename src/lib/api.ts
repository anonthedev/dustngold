import { Art, ArtType } from './store';
import { ArtFormValues } from './schemas';

// Function to get all arts
export async function getAllArts(): Promise<Art[]> {
  const response = await fetch('/api/arts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch arts');
  }
  return response.json();
}

// Function to get a single art by uuid
export async function getArtById(uuid: string): Promise<Art> {
  const response = await fetch(`/api/arts/${uuid}`);
  if (!response.ok) {
    throw new Error('Failed to fetch art');
  }
  return response.json();
}

// Function to add a new art
export async function addArt(art: ArtFormValues, userId: string): Promise<Art> {
  const response = await fetch('/api/arts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...art,
      votes: 0,
      submitted_by: userId,
    }),
  });
  
  if (response.status === 401) {
    throw new Error('You must be logged in to add art');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add art');
  }
  
  return response.json();
}

// Function to toggle upvote on an art
export async function upvoteArt(uuid: string): Promise<Art> {
  const response = await fetch(`/api/arts/${uuid}/upvote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (response.status === 401) {
    throw new Error('You must be logged in to upvote');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update vote');
  }
  
  return response.json();
}

// Function to filter arts by type
export async function getArtsByType(type: ArtType): Promise<Art[]> {
  const response = await fetch(`/api/arts?type=${type}`);
  if (!response.ok) {
    throw new Error('Failed to fetch arts by type');
  }
  return response.json();
}
