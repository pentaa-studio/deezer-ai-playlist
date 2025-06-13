import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { deezerService } from '@/lib/deezer';
import { generatePlaylistFromDeezer } from '@/lib/generator';

// TODO: Utiliser function calling pour extraire mood/style/genre
// TODO: Ajouter une validation avec Zod

export const runtime = 'edge';

// Unused functions - kept for future use
// function shouldGeneratePlaylist(messages: Array<{role: string, content: string}>): boolean {
//   const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
//   const conversationLength = messages.length;
//   
//   const generateKeywords = [
//     'génère', 'crée', 'fais', 'lance', 'go', 'ok', 'oui', 'parfait', 
//     'c\'est bon', 'allons-y', 'maintenant', 'playlist maintenant'
//   ];
//   
//   const hasGenerateKeyword = generateKeywords.some(keyword => 
//     lastUserMessage.toLowerCase().includes(keyword)
//   );
//   
//   return hasGenerateKeyword || conversationLength >= 5;
// }

// function extractPlaylistContext(messages: Array<{role: string, content: string}>): string {
//   const userMessages = messages
//     .filter(m => m.role === 'user')
//     .map(m => m.content)
//     .join(' ');
//   
//   return userMessages;
// }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body?.messages || [];
    
    console.log('Received messages:', messages.length);
    
    if (messages.length === 0) {
      return new Response("Messages manquants", { status: 400 });
    }

    const result = await streamText({
      model: openai('gpt-4'),
      messages: messages.map((m: {role: string, content: string}) => ({
        role: m.role,
        content: m.content
      })),
      system: `Tu es un assistant musical expert et passionné. Tu aides les utilisateurs à découvrir et créer des playlists personnalisées.

Ton rôle :
- Discuter de musique de manière naturelle et engageante
- Poser des questions pertinentes pour comprendre les goûts musicaux
- Utiliser les outils disponibles pour rechercher de la musique et créer des playlists
- Donner des recommandations musicales personnalisées
- Expliquer tes choix musicaux

Comportement :
- Sois conversationnel, amical et passionné de musique
- Pose UNE question à la fois pour ne pas submerger l'utilisateur
- Utilise les outils quand c'est pertinent (recherche, création de playlist)
- Partage des anecdotes musicales intéressantes
- Adapte-toi au niveau de connaissance musicale de l'utilisateur

Quand utiliser les outils :
- searchMusic : pour explorer des artistes, genres ou morceaux spécifiques
- createPlaylist : quand l'utilisateur veut générer une playlist complète
- getPopularTracks : pour découvrir les tendances actuelles`,

      tools: {
        searchMusic: tool({
          description: 'Recherche des morceaux sur Deezer par artiste, titre, genre ou mot-clé',
          parameters: z.object({
            query: z.string().describe('Terme de recherche (artiste, titre, genre, etc.)'),
            limit: z.number().optional().default(5).describe('Nombre de résultats (max 10)')
          }),
          execute: async ({ query, limit = 5 }) => {
            console.log(`Searching music: ${query}`);
            try {
              const tracks = await deezerService.searchTracks(query, Math.min(limit, 10));
              return {
                success: true,
                tracks: tracks.map(track => ({
                  id: track.id,
                  title: track.title,
                  artist: track.artist.name,
                  album: track.album.title,
                  preview: track.preview,
                  cover: track.album.cover_medium || track.album.cover_small || track.album.cover,
                  duration: track.duration
                })),
                query
              };
            } catch (error) {
              console.error('Search error:', error);
              return {
                success: false,
                error: 'Erreur lors de la recherche musicale',
                query
              };
            }
          }
        }),

        createPlaylist: tool({
          description: 'Crée une playlist personnalisée basée sur les préférences de l\'utilisateur',
          parameters: z.object({
            description: z.string().describe('Description détaillée du type de playlist souhaité'),
            genre: z.string().optional().describe('Genre musical principal'),
            mood: z.string().optional().describe('Ambiance ou mood recherché'),
            count: z.number().optional().default(10).describe('Nombre de morceaux (5-20)')
          }),
          execute: async ({ description, genre, mood, count = 10 }) => {
            console.log(`Creating playlist: ${description}`);
            try {
              const tracks = await generatePlaylistFromDeezer(
                genre || null, 
                mood || null, 
                Math.min(Math.max(count, 5), 20), 
                description
              );
              
              const playlistTitle = `Playlist ${genre || ''} ${mood || ''}`.trim() || 'Ma Playlist IA';
              
              return {
                success: true,
                playlist: {
                  title: playlistTitle,
                  tracks: tracks,
                  description
                }
              };
            } catch (error) {
              console.error('Playlist creation error:', error);
              return {
                success: false,
                error: 'Erreur lors de la création de la playlist'
              };
            }
          }
        }),

        getPopularTracks: tool({
          description: 'Récupère les morceaux populaires du moment',
          parameters: z.object({
            genre: z.string().optional().describe('Genre spécifique (optionnel)'),
            limit: z.number().optional().default(10).describe('Nombre de morceaux (max 15)')
          }),
          execute: async ({ genre, limit = 10 }) => {
            console.log(`Getting popular tracks: ${genre || 'all genres'}`);
            try {
              const query = genre ? `${genre} hits 2024` : 'top hits 2024';
              const tracks = await deezerService.searchTracks(query, Math.min(limit, 15));
              
              return {
                success: true,
                tracks: tracks.map(track => ({
                  id: track.id,
                  title: track.title,
                  artist: track.artist.name,
                  album: track.album.title,
                  preview: track.preview,
                  cover: track.album.cover_medium || track.album.cover_small || track.album.cover
                })),
                genre: genre || 'tous genres'
              };
            } catch (error) {
              console.error('Popular tracks error:', error);
              return {
                success: false,
                error: 'Erreur lors de la récupération des morceaux populaires'
              };
            }
          }
        })
      },

      onFinish: async ({ finishReason, toolCalls, toolResults }) => {
        console.log('Finish reason:', finishReason);
        console.log('Tool calls:', toolCalls?.length || 0);
        
        // Si une playlist a été créée, on l'ajoute au message
        if (toolResults) {
          for (const result of toolResults) {
            if (result.toolName === 'createPlaylist' && result.result.success && result.result.playlist) {
              const playlist = result.result.playlist;
              console.log('Playlist created:', playlist.title);
            }
          }
        }
      }
    });

    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response(`Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}