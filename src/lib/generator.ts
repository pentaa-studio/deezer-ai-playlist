import { deezerService, DeezerTrack } from "./deezer";

export type Track = {
  id: number;
  title: string;
  artist: string;
  album?: string;
  preview?: string;
  tag: "search" | "popular";
};

// Convert Deezer track to our Track format
function convertDeezerTrack(deezerTrack: DeezerTrack, tag: "search" | "popular"): Track {
  return {
    id: deezerTrack.id,
    title: deezerTrack.title,
    artist: deezerTrack.artist.name,
    album: deezerTrack.album.title,
    preview: deezerTrack.preview,
    tag
  };
}

export async function generatePlaylistFromDeezer(
  genre: string | null, 
  mood: string | null, 
  count: number = 10
): Promise<Track[]> {
  try {
    // Build search queries based on parsed prompt
    const searchQueries = [];
    
    // Base query with genre and mood
    if (genre && mood) {
      searchQueries.push(`${genre} ${mood}`);
    } else if (genre) {
      searchQueries.push(genre);
    } else if (mood) {
      searchQueries.push(mood);
    }
    
    // Add popular/trending queries
    searchQueries.push("top hits 2024");
    searchQueries.push("popular music");
    
    // If no specific criteria, use general queries
    if (searchQueries.length === 0) {
      searchQueries.push("popular hits", "top songs");
    }
    
    const allTracks: Track[] = [];
    const tracksPerQuery = Math.ceil(count / searchQueries.length);
    
    // Search tracks for each query
    for (const query of searchQueries) {
      const deezerTracks = await deezerService.searchTracks(query, tracksPerQuery);
      const tracks = deezerTracks.map(track => 
        convertDeezerTrack(track, query.includes("top") || query.includes("popular") ? "popular" : "search")
      );
      allTracks.push(...tracks);
    }
    
    // Remove duplicates and shuffle
    const uniqueTracks = allTracks.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    );
    
    return shuffle(uniqueTracks).slice(0, count);
    
  } catch (error) {
    console.error('Error generating playlist from Deezer:', error);
    // Fallback to mock data if Deezer fails
    return generatePlaylistMock(count);
  }
}

// Fallback function using mock data
export function generatePlaylistMock(count: number = 10): Track[] {
  const mockTracks: Track[] = [
    { id: 1, title: "Bohemian Rhapsody", artist: "Queen", tag: "search" },
    { id: 2, title: "Stairway to Heaven", artist: "Led Zeppelin", tag: "search" },
    { id: 3, title: "Imagine", artist: "John Lennon", tag: "popular" },
    { id: 4, title: "Smells Like Teen Spirit", artist: "Nirvana", tag: "popular" },
    { id: 5, title: "Sweet Child O' Mine", artist: "Guns N' Roses", tag: "search" },
    { id: 6, title: "Billie Jean", artist: "Michael Jackson", tag: "popular" },
    { id: 7, title: "Hotel California", artist: "Eagles", tag: "search" },
    { id: 8, title: "Purple Rain", artist: "Prince", tag: "popular" },
    { id: 9, title: "Like a Rolling Stone", artist: "Bob Dylan", tag: "search" },
    { id: 10, title: "Thriller", artist: "Michael Jackson", tag: "popular" },
  ];
  
  return shuffle(mockTracks).slice(0, count);
}

// Keep the original function for backward compatibility
export function generatePlaylist(count: number = 10): Track[] {
  return generatePlaylistMock(count);
}

function shuffle<T>(arr: T[]): T[] {
  return arr.map(v => [Math.random(), v] as [number, T])
    .sort((a, b) => a[0] - b[0])
    .map(([_, v]) => v);
} 