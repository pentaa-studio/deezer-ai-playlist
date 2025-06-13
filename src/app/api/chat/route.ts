import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { parsePrompt } from '@/lib/parser';
import { generatePlaylistFromDeezer } from '@/lib/generator';

// TODO: Utiliser function calling pour extraire mood/style/genre
// TODO: Ajouter une validation avec Zod

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // useChat envoie { messages: [...] }
    const messages = body?.messages || [];
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content || body?.prompt || "";
    
    console.log('Received prompt:', prompt);
    
    if (!prompt) {
      return new Response("Prompt manquant", { status: 400 });
    }
    
    const { genre, mood, style } = parsePrompt(prompt);
    console.log('Parsed:', { genre, mood, style });
    
    // Generate playlist from Deezer API
    const playlist = await generatePlaylistFromDeezer(genre, mood, 10);
    console.log('Generated playlist from Deezer:', playlist.length, 'tracks');

    // Create playlist title
    const playlistTitle = `Playlist ${genre || ''} ${mood || ''} ${style || ''}`.trim();

    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      prompt: `Génère une description narrative courte et engageante pour une playlist ${genre || ''} ${mood || ''} ${style || ''}. Voici les morceaux : ${JSON.stringify(playlist)}. 

IMPORTANT: À la fin de ta description, ajoute exactement cette ligne :
---PLAYLIST_DATA---
${JSON.stringify({ title: playlistTitle, tracks: playlist })}
---END_PLAYLIST_DATA---`,
      system: 'Tu es un expert en musique. Génère une description narrative courte pour une playlist, puis ajoute les données JSON exactement comme demandé.',
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('API Error:', error);
    return new Response(`Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}