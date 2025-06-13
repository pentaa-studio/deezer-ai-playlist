import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { parsePrompt } from '@/lib/parser';
import { generatePlaylistFromDeezer } from '@/lib/generator';

// TODO: Utiliser function calling pour extraire mood/style/genre
// TODO: Ajouter une validation avec Zod

export const runtime = 'edge';

// Check if user wants to generate playlist based on conversation
function shouldGeneratePlaylist(messages: Array<{role: string, content: string}>): boolean {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  const conversationLength = messages.length;
  
  // Generate playlist if:
  // 1. User explicitly asks to generate/create playlist
  // 2. User confirms after AI questions
  // 3. Conversation has enough context (3+ exchanges)
  
  const generateKeywords = [
    'génère', 'crée', 'fais', 'lance', 'go', 'ok', 'oui', 'parfait', 
    'c\'est bon', 'allons-y', 'maintenant', 'playlist maintenant'
  ];
  
  const hasGenerateKeyword = generateKeywords.some(keyword => 
    lastUserMessage.toLowerCase().includes(keyword)
  );
  
  return hasGenerateKeyword || conversationLength >= 5;
}

// Extract playlist requirements from conversation
function extractPlaylistContext(messages: Array<{role: string, content: string}>): string {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');
  
  return userMessages;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // useChat envoie { messages: [...] }
    const messages = body?.messages || [];
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content || body?.prompt || "";
    
    console.log('Received prompt:', prompt);
    console.log('Conversation length:', messages.length);
    
    if (!prompt) {
      return new Response("Prompt manquant", { status: 400 });
    }
    
    // Check if we should generate playlist or continue conversation
    if (shouldGeneratePlaylist(messages)) {
      console.log('Generating playlist...');
      
      // Extract full context from conversation
      const fullContext = extractPlaylistContext(messages);
      const { genre, mood, style } = parsePrompt(fullContext);
      console.log('Parsed from conversation:', { genre, mood, style });
      
      // Generate playlist from Deezer API with full conversation context
      const playlist = await generatePlaylistFromDeezer(genre, mood, 10, fullContext);
      console.log('Generated playlist from Deezer:', playlist.length, 'tracks');

      // Create playlist title
      const playlistTitle = `Playlist ${genre || ''} ${mood || ''} ${style || ''}`.trim();

      const result = await streamText({
        model: openai('gpt-3.5-turbo'),
        prompt: `Génère une description narrative courte et engageante pour une playlist basée sur cette conversation : "${fullContext}". Voici les morceaux trouvés : ${JSON.stringify(playlist)}. 

IMPORTANT: À la fin de ta description, ajoute exactement cette ligne :
---PLAYLIST_DATA---
${JSON.stringify({ title: playlistTitle, tracks: playlist })}
---END_PLAYLIST_DATA---`,
        system: 'Tu es un expert en musique. Génère une description narrative courte pour une playlist, puis ajoute les données JSON exactement comme demandé.',
      });

      return result.toDataStreamResponse();
      
    } else {
      console.log('Continuing conversation...');
      
      // Continue conversation to better understand user needs
      const conversationHistory = messages.map((m: {role: string, content: string}) => ({
        role: m.role,
        content: m.content
      }));

      const result = await streamText({
        model: openai('gpt-3.5-turbo'),
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant musical expert qui aide à créer des playlists personnalisées. 

Ton rôle est de poser des questions pertinentes pour mieux comprendre les goûts et besoins de l'utilisateur avant de générer une playlist.

Pose des questions sur :
- Le genre musical préféré
- L'ambiance/mood recherchée  
- Le contexte d'écoute (sport, travail, détente, fête, etc.)
- La période/époque musicale
- Les artistes aimés/détestés
- L'occasion spéciale

Sois conversationnel, amical et pose UNE question à la fois. Quand tu as assez d'informations (après 2-3 échanges), propose de générer la playlist en disant quelque chose comme "Parfait ! Je peux maintenant créer ta playlist. Dis-moi 'génère' quand tu es prêt !"`
          },
          ...conversationHistory
        ]
      });

      return result.toDataStreamResponse();
    }
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response(`Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}