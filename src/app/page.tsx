"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "ai/react";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <main className="max-w-xl mx-auto py-12 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center mb-4">Text to Playlist</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ex: Playlist funk joyeuse pour l'été"
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input}>
          {isLoading ? "Génération..." : "Générer la playlist"}
        </Button>
      </form>
      <section className="flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground">Aucune playlist générée pour l'instant.</p>
        )}
        {messages.map((message, idx) => (
          <div key={idx} className="p-4 border rounded-lg bg-card">
            <p>{message.content}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
