import React from "react";
import { createRoot } from "react-dom/client";
import { sql, parse } from "composed-sql";
// @ts-ignore
import wasmUrl from "@vlcn.io/wa-crsqlite/wa-sqlite-async.wasm?url";
import sqliteWasm from "@vlcn.io/wa-crsqlite";
import { createSchema } from "./schema";
import { useQueryA } from "composed-sql-react";

async function main() {
  const sqlite = await sqliteWasm((file) => wasmUrl);

  const db = await sqlite.open(":memory:");
  (window as any).db = db;

  await createSchema(db);

  const root = createRoot(document.getElementById("content")!);
  root.render(<App />);
}

function App() {
  return (
    <div>
      <Playlist playlistId={1} />
    </div>
  );
}

const artistsFrag = sql`[SELECT {
  id: Artist.ArtistId,
  name: Artist.Name
} FROM Artist
  JOIN Album
  ON Album.ArtistId = Artist.ArtistId
  WHERE Album.AlbumId = t.AlbumId]`;

type Artist = { id: string; name: string };
function ArtistsCell({ artists }: { artists: Artist[] }) {}

const trackFrag = sql`
  id: t.TrackId,
  name: t.Name,
  album: (SELECT Album.Title FROM Album WHERE Album.AlbumId = t.AlbumId),
  duration: t.Milliseconods,
  artists: ${artistsFrag}
`;

type Track = {
  id: string;
  name: string;
  album: string;
  duration: number;
  artists: Artist[];
};
function Track({ track }: { track: Track }) {}

const playlistQuery = sql`
SELECT {
  id: p.PlaylistId,
  name: p.Name,
  tracks: [SELECT {
    ${trackFrag}
  } FROM PlaylistTrack AS pt JOIN Track AS t ON t.TrackId = pt.TrackId WHERE pt.PlaylistId = p.PlaylistId]
} FROM Playlist AS p WHERE p.PlaylistId = ?`;
type Playlist = {
  tracks: Track[];
};

function Playlist({ playlistId }: { playlistId: number }) {
  // useQueryA([])
  console.log(parse(playlistQuery));
  return <div>playlist</div>;
}

main();
