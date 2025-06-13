// Extracts mood, style, and genre from a user prompt using regex (fallback) or GPT (TODO)
// TODO: Utiliser GPT pour un parsing plus intelligent
export function parsePrompt(prompt: string) {
  if (!prompt || typeof prompt !== "string") {
    return { genre: null, mood: null, style: null };
  }

  const genreRegex = /(rock|pop|jazz|blues|funk|soul|reggae|hip-hop|rap|électro|house|techno|classique|folk|country|metal|punk|indie|alternative)/i;
  const moodRegex = /(joyeux|triste|énergique|calme|romantique|mélancolique|festif|relaxant|motivant|nostalgique)/i;
  const styleRegex = /(playlist|mix|compilation|sélection|best of|top|hits|essentiels)/i;

  const genre = prompt.match(genreRegex)?.[0] || null;
  const mood = prompt.match(moodRegex)?.[0] || null;
  const style = prompt.match(styleRegex)?.[0] || null;

  return { genre, mood, style };
} 