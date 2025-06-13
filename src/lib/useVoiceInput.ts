// Hook pour l'entrée vocale (Web Speech API)
// TODO: Implémenter la logique de reconnaissance vocale
import { useState } from "react";

export function useVoiceInput() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  // TODO: Ajouter la logique Web Speech API ici

  return {
    listening,
    transcript,
    start: () => setListening(true), // à remplacer par la vraie logique
    stop: () => setListening(false),
    reset: () => setTranscript("")
  };
} 