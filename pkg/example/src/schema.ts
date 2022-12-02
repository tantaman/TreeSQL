import { DB } from "@vlcn.io/wa-crsqlite";

export async function createSchema(db: DB) {
  await db.execMany([
    "CREATE TABLE albums (id primary key, name, colors_string);",
    "CREATE TABLE tracks (id primary key, name, album_id, track_number, duration_ms);",
    "CREATE TABLE artists (id primary key, name, colors_string);",
    "CREATE TABLE tracks_artists (track_id, artist_id, primary key (track_id, artist_id));",
    "CREATE TABLE tracks_playlists (track_id, playlist_id, track_index, added_at_timestamp, primary key (playlist_id, track_id));",
    "CREATE TABLE playlists (id primary key, name, description, collaborative, owner_id, owner_name, colors_string);",

    "CREATE INDEX track_to_playlists ON tracks_playlists (playlist_id);",
    "CREATE INDEX artist_to_tracks ON track_artists (artist_id);",
  ]);
}
