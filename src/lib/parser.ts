// Extracts mood, style, and genre from a user prompt using regex (fallback) or GPT (TODO)
// TODO: Utiliser GPT pour un parsing plus intelligent
export function parsePrompt(prompt: string) {
  // Simple regex pour mood/style/genre
  const genreRegex = /(rock|pop|funk|jazz|rap|hip[- ]?hop|electro|classique|metal|chill|lofi|rnb|blues|country|reggae|soul|folk|disco|techno|house|trap|punk|indie)/i;
  const moodRegex = /(joyeux|triste|motivant|calme|nostalgique|énergique|romantique|festif|détente|mélancolique|positif|dark|cool|ambiance|été|hiver|printemps|automne)/i;
  const styleRegex = /(playlist|mix|compilation|sélection|best of|top|hits|essentiels)/i;

  const genre = prompt.match(genreRegex)?.[0] || null;
  const mood = prompt.match(moodRegex)?.[0] || null;
  const style = prompt.match(styleRegex)?.[0] || null;

  return { genre, mood, style };
} 