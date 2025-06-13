import favourites from "@/data/favourites.json";
import buzz from "@/data/buzz_mock.json";

export type Track = {
  title: string;
  artist: string;
  tag: "fav" | "buzz";
};

export function generatePlaylist(count: number = 10) {
  const favCount = Math.round(count * 0.4);
  const buzzCount = count - favCount;
  const favTracks = shuffle(favourites).slice(0, favCount).map(t => ({ ...t, tag: "fav" as const }));
  const buzzTracks = shuffle(buzz).slice(0, buzzCount).map(t => ({ ...t, tag: "buzz" as const }));
  return shuffle([...favTracks, ...buzzTracks]);
}

function shuffle<T>(arr: T[]): T[] {
  return arr.map(v => [Math.random(), v] as [number, T])
    .sort((a, b) => a[0] - b[0])
    .map(([_, v]) => v);
} 