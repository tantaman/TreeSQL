import React from "react";
import { createRoot } from "react-dom/client";
import { sql, parse } from "composed-sql";
// @ts-ignore
import wasmUrl from "@vlcn.io/wa-crsqlite/wa-sqlite-async.wasm?url";
import sqliteWasm from "@vlcn.io/wa-crsqlite";
import tblrx from "@vlcn.io/rx-tbl";
import { createSchema } from "./schema";
import { Ctx, useQueryA, useQueryJ } from "composed-sql-react";

async function main() {
  const sqlite = await sqliteWasm((file) => wasmUrl);

  const db = await sqlite.open(":memory:");
  (window as any).db = db;
  const rx = await tblrx(db);

  await createSchema(db);

  const root = createRoot(document.getElementById("content")!);
  root.render(
    <App
      ctx={{
        db,
        rx,
      }}
    />
  );
}

function App({ ctx }: { ctx: Ctx }) {
  return (
    <div>
      <Playlist ctx={ctx} playlistId={1} />
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
  duration: t.Milliseconds,
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

// TODO: need a better way to impose
// limits on json_group_array rather than selecting
// from limited sub-select.
// We should extend the grammar to parse out limits and offsets
// and re-roll the query in those cases
const playlistQuery = sql`
SELECT {
  id: p.PlaylistId,
  name: p.Name,
  tracks: [SELECT {
    ${trackFrag}
  } FROM (SELECT * FROM PlaylistTrack AS pt
    JOIN Track ON Track.TrackId = pt.TrackId
    WHERE pt.PlaylistId = p.PlaylistId
    LIMIT 200) as t]
} FROM Playlist AS p WHERE p.PlaylistId = ?`;
type Playlist = {
  tracks: Track[];
};

console.log(parse(playlistQuery));
function Playlist({ ctx, playlistId }: { ctx: Ctx; playlistId: number }) {
  const data = useQueryJ(
    ctx,
    ["Playlist", "Album", "Track", "Artist", "PlaylistTrack"],
    playlistQuery,
    [playlistId]
  );
  console.log(data);
  return <div>playlist</div>;
}

main();
