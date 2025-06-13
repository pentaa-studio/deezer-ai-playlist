"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from '@ai-sdk/react'
import { useState, useEffect } from 'react';
import DeezerPlayer from '@/components/DeezerPlayer';
import { Track } from '@/lib/generator';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat();
  const [currentPlaylist, setCurrentPlaylist] = useState<{title: string, tracks: Track[]} | null>(null);

  // Extract playlist data from assistant messages
  const extractPlaylistData = (content: string) => {
    try {
      // Look for data between markers
      const startMarker = '---PLAYLIST_DATA---';
      const endMarker = '---END_PLAYLIST_DATA---';
      
      const startIndex = content.indexOf(startMarker);
      const endIndex = content.indexOf(endMarker);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const jsonStr = content.substring(startIndex + startMarker.length, endIndex).trim();
        const playlistData = JSON.parse(jsonStr);
        setCurrentPlaylist(playlistData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to extract playlist data:', error);
      return false;
    }
  };

  // Clean description by removing playlist data
  const cleanDescription = (content: string) => {
    const startMarker = '---PLAYLIST_DATA---';
    const startIndex = content.indexOf(startMarker);
    if (startIndex !== -1) {
      return content.substring(0, startIndex).trim();
    }
    return content;
  };

  // Check for new assistant messages and extract playlist data
  useEffect(() => {
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
    if (lastAssistantMessage) {
      extractPlaylistData(lastAssistantMessage.content);
    }
  }, [messages]);

  return (
    <main className="max-w-4xl mx-auto py-12 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center mb-4">Text to Playlist</h1>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ex: Playlist funk joyeuse pour l'été"
          className="flex-1"
        />
        <Button type="submit" disabled={status === "streaming" || !input}>
          {status === "streaming" ? "Génération..." : "Générer la playlist"}
        </Button>
      </form>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Description */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Description IA</h2>
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground">Aucune playlist générée pour l'instant.</p>
          )}
          {messages.map((message, idx) => (
            <div key={idx} className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-gray-500 mb-2">Role: {message.role}</p>
              <p className="whitespace-pre-wrap">{cleanDescription(message.content)}</p>
            </div>
          ))}
        </section>

        {/* Deezer Player */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Player Deezer</h2>
          {currentPlaylist ? (
            <DeezerPlayer 
              tracks={currentPlaylist.tracks} 
              title={currentPlaylist.title}
            />
          ) : (
            <p className="text-center text-muted-foreground p-8 border rounded-lg">
              Générez une playlist pour voir le player Deezer
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
