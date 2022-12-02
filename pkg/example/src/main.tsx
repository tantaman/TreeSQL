import React from "react";
import { createRoot } from "react-dom/client";
import { sql } from "composed-sql";
// @ts-ignore
import wasmUrl from "@vlcn.io/wa-crsqlite/wa-sqlite-async.wasm?url";
import sqliteWasm from "@vlcn.io/wa-crsqlite";
import { createSchema } from "./schema";

async function main() {
  const sqlite = await sqliteWasm((file) => wasmUrl);

  const db = await sqlite.open(":memory:");
  (window as any).db = db;

  await createSchema(db);

  const root = createRoot(document.getElementById("content")!);
  root.render(<App />);
}

function App() {
  return <div>App</div>;
}

const artistsFrag = sql`[SELECT {
  id: art.id,
  name: art.name
} FROM artists AS art
  LEFT JOIN tracks_artists AS ta
  ON ta.artist_id = art.id
  WHERE ta.track_id = t.id]`;

type Artist = { id: string; name: string };
function ArtistsCell({ artists }: { artists: Artist[] }) {}

const trackFrag = sql`
(SELECT {
  id: t.id,
  name: t.name,
  durationMs: t.duration_ms,
  trackNumer: t.track_number,
  album: (SELECT a.name FROM albums AS a WHERE a.id = t.album_id),
  artists: ${artistsFrag},
} FROM tracks AS t WHERE t.id = tp.track_id)`;

type Track = {
  id: string;
  name: string;
  duration: number;
  trackNumber: number;
  album: string;
  artists: Artist[];
};
function Track({ track }: { track: Track }) {}

const playlistQuery = sql`
SELECT {
  tracks: [SELECT {
    addedAt: tp.added_at_timestamp,
    trackNumber: tp.track_index,
    track: ${trackFrag}
  } FROM tracks_playlists as tp WHERE tp.playlist_id = p.id]
} FROM playlists AS p WHERE p.id = ?`;

type Playlist = {
  tracks: Track[];
};
function Playlist({ playlistId }: { playlistId: string }) {}
