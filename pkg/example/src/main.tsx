import React from "react";
import { createRoot } from "react-dom/client";
import { sql } from "composed-sql";

type TODO = any;

async function main() {}

function App() {}

const playlistQuery = sql`
SELECT {
  tracks: [SELECT {
    addedAt: tp.added_at_timestamp,
    trackNumber: tp.track_index,
    track: ${include(trackFrag)}
  } FROM spotify_tracks_playlists as tp WHERE tp.playlist_id = p.id]
} FROM spotify_playlists AS p WHERE p.id = ?
`;

function Playlist() {}

// unroll where by pulling out anything that comes
// from the outer table
// then lazy subscribe to that fragment
const trackFrag = frag`
(SELECT {
  id: t.id,
  name: t.name,
  durationMs: t.duration_ms,
  trackNumer: t.track_number,
  album: (SELECT a.name FROM spotify_albums AS a WHERE a.id = t.album_id),
  artists: ${include(artistsFrag)},
} FROM spotify_tracks AS t WHERE t.id = tp.track_id)
`;
function Track(props: { track: TODO }) {
  const data = useFrag(trackFrag, props.track);
}

const artistsFrag = frag`
[SELECT {
  id: art.id,
  name: art.name
} FROM spotify_artists AS art
  LEFT JOIN spotify_tracks_artists AS ta
  ON ta.artist_id = art.id
  WHERE ta.track_id = t.id]
`;
function ArtistsCell(props: { artists: TODO }) {
  const data = useFrag(artistsFrag, props.artists);
}
