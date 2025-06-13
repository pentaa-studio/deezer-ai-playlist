import { Button } from "@/components/ui/button";
import { Track } from "@/lib/generator";
import { Star, Target, Play } from "lucide-react";

export default function PlaylistCard({ title, artist, tag }: Track) {
  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg bg-card">
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{artist}</div>
      </div>
      {tag === "search" ? (
        <span className="flex items-center gap-1 text-blue-500">
          <Target size={16} />
          <span>Search</span>
        </span>
      ) : (
        <span className="flex items-center gap-1 text-red-500">
          <Star size={16} />
          <span>Popular</span>
        </span>
      )}
      <Button variant="outline" size="icon" title="Play (simulé)">
        <Play size={16} />
      </Button>
    </div>
  );
} 