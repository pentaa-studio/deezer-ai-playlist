import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { parsePrompt } from '@/lib/parser';
import { generatePlaylist } from '@/lib/generator';

// TODO: Utiliser function calling pour extraire mood/style/genre
// TODO: Ajouter une validation avec Zod

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const { genre, mood, style } = parsePrompt(prompt);
  const playlist = generatePlaylist(10);

  const response = await streamText({
    model: openai('gpt-3.5-turbo'),
    messages: [
      {
        role: 'system',
        content: 'Tu es un expert en musique. Génère une description narrative pour une playlist.',
      },
      {
        role: 'user',
        content: `Génère une description pour une playlist ${genre || ''} ${mood || ''} ${style || ''}. Voici les morceaux : ${JSON.stringify(playlist)}`,
      },
    ],
  });

  return response.toDataStreamResponse();
} 