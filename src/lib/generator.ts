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

// Generate smart search queries based on prompt analysis
function generateSearchQueries(genre: string | null, mood: string | null, prompt: string): string[] {
  const queries: string[] = [];
  
  // Base query with genre and mood
  if (genre && mood) {
    queries.push(`${genre} ${mood}`);
  }
  
  // Genre-specific queries
  if (genre) {
    switch (genre.toLowerCase()) {
      case 'funk':
        queries.push('funk disco', 'james brown', 'parliament funkadelic', 'funk soul');
        break;
      case 'rock':
        queries.push('classic rock', 'alternative rock', 'indie rock', 'rock hits');
        break;
      case 'jazz':
        queries.push('jazz standards', 'smooth jazz', 'jazz fusion', 'bebop');
        break;
      case 'pop':
        queries.push('pop hits', 'mainstream pop', 'pop rock', 'dance pop');
        break;
      case 'hip-hop':
      case 'rap':
        queries.push('hip hop', 'rap hits', 'urban music', 'hip hop classics');
        break;
      case 'électro':
      case 'house':
      case 'techno':
        queries.push('electronic music', 'dance music', 'edm', 'electronic hits');
        break;
      default:
        queries.push(genre);
    }
  }
  
  // Mood-specific queries
  if (mood) {
    switch (mood.toLowerCase()) {
      case 'joyeux':
      case 'festif':
        queries.push('happy songs', 'feel good music', 'upbeat', 'party music');
        break;
      case 'calme':
      case 'relaxant':
        queries.push('chill music', 'relaxing songs', 'ambient', 'peaceful');
        break;
      case 'énergique':
      case 'motivant':
        queries.push('energetic music', 'workout songs', 'pump up', 'high energy');
        break;
      case 'romantique':
        queries.push('love songs', 'romantic music', 'ballads', 'slow songs');
        break;
      case 'mélancolique':
      case 'triste':
        queries.push('sad songs', 'melancholic music', 'emotional', 'indie folk');
        break;
      default:
        queries.push(mood);
    }
  }
  
  // Context-specific queries from prompt
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('été')) {
    queries.push('summer hits', 'summer vibes', 'beach music');
  }
  if (lowerPrompt.includes('hiver')) {
    queries.push('winter songs', 'cozy music', 'christmas music');
  }
  if (lowerPrompt.includes('sport') || lowerPrompt.includes('gym')) {
    queries.push('workout music', 'gym songs', 'running music');
  }
  if (lowerPrompt.includes('travail') || lowerPrompt.includes('bureau')) {
    queries.push('focus music', 'work music', 'concentration');
  }
  if (lowerPrompt.includes('fête') || lowerPrompt.includes('party')) {
    queries.push('party hits', 'dance music', 'club music');
  }
  if (lowerPrompt.includes('barbecue') || lowerPrompt.includes('weekend')) {
    queries.push('weekend vibes', 'bbq music', 'chill hits', 'good vibes');
  }
  if (lowerPrompt.includes('voiture') || lowerPrompt.includes('route')) {
    queries.push('road trip music', 'driving songs', 'car music');
  }
  
  // Add some variety with popular searches
  queries.push('top hits 2024', 'viral songs', 'trending music');
  
  // Remove duplicates and limit
  return [...new Set(queries)].slice(0, 6);
}

export async function generatePlaylistFromDeezer(
  genre: string | null, 
  mood: string | null, 
  count: number = 10,
  prompt: string = ""
): Promise<Track[]> {
  try {
    const searchQueries = generateSearchQueries(genre, mood, prompt);
    console.log('Generated search queries:', searchQueries);
    
    const allTracks: Track[] = [];
    const tracksPerQuery = Math.max(2, Math.ceil(count / searchQueries.length));
    
    // Search tracks for each query
    for (const query of searchQueries) {
      const deezerTracks = await deezerService.searchTracks(query, tracksPerQuery);
      const tracks = deezerTracks.map(track => 
        convertDeezerTrack(track, query.includes("top") || query.includes("hits") || query.includes("trending") ? "popular" : "search")
      );
      allTracks.push(...tracks);
    }
    
    // Remove duplicates based on track ID
    const uniqueTracks = allTracks.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    );
    
    // Shuffle and limit to requested count
    const shuffledTracks = shuffle(uniqueTracks);
    
    // Ensure we have enough tracks, if not add some popular hits
    if (shuffledTracks.length < count) {
      const additionalTracks = await deezerService.searchTracks('popular hits', count - shuffledTracks.length);
      const convertedAdditional = additionalTracks
        .filter(track => !shuffledTracks.some(existing => existing.id === track.id))
        .map(track => convertDeezerTrack(track, "popular"));
      shuffledTracks.push(...convertedAdditional);
    }
    
    return shuffledTracks.slice(0, count);
    
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