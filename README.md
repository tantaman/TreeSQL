# TreeSQL

This is just a prototype of an alternate SQL syntax to pull hierarchies.


<a href="https://twitter.com/schickling/status/1599076832107630594"><img src="https://github.com/tantaman/TreeQL/assets/1009003/427e045e-3fae-4ad8-a3f1-60ca2849a240"/></a>

A SQL that composes well and where the structure of the query matches the output of the query.

```sql
SELECT {
  tracks: [SELECT {
    addedAt: tp.added_at_timestamp,
    trackNumber: tp.track_index,
    track: (SELECT {
      id: t.id
      name: t.name,
      durationMs: t.duration_ms,
      trackNumer: t.track_number,
      album: (SELECT a.name FROM spotify_albums AS a WHERE a.id = t.album_id),
      artists: [SELECT {
        id: art.id,
        name: art.name
      } FROM spotify_artists AS art
        LEFT JOIN spotify_tracks_artists AS ta
        ON ta.artist_id = art.id
        WHERE ta.track_id = t.id],
    } FROM spotify_tracks AS t WHERE t.id = tp.track_id)
  } FROM spotify_tracks_playlists as tp WHERE tp.playlist_id = p.id]
} FROM spotify_playlists AS p WHERE p.id = ?
```

yields ->

```json
{
  "tracks": [
    {
      "addedAt": 1655612865000,
      "trackNumber": 1.0,
      "track": {
        "id": "spotify:track:2HdUFfnpBSxj2AsqhdrVTo",
        "name": "Reptilians - Chee Remix",
        "durationMs": 226046,
        "trackNumer": 0,
        "album": "Reptilians (Chee Remix)",
        "artists": [
          { "id": "spotify:artist:4YWj8sohRDjL9deiuRvEEY", "name": "Noisia" },
          { "id": "spotify:artist:54qqaSH6byJIb8eFWxe3Pj", "name": "Mefjus" },
          { "id": "spotify:artist:6dvHFhruyFyf26otoWOXKR", "name": "Hybris" },
          { "id": "spotify:artist:18fX4a2lpLLHmvJO2a5NkA", "name": "Chee" }
        ],
      }
    },
...
  ],
}
```

via ->

```sql
SELECT
  json_object(
    'tracks',
    (
      SELECT
        json_group_array(
          json_object(
            'addedAt',
            tp.added_at_timestamp,
            'trackNumber',
            tp.track_index,
            'track',
            (
              SELECT
                json_object(
                  'id',
                  t.id,
                  'name',
                  t.name,
                  'durationMs',
                  t.duration_ms,
                  'trackNumer',
                  t.track_number,
                  'album',
                  (
                    SELECT
                      a.name
                    FROM
                      spotify_albums AS a
                    WHERE
                      a.id = t.album_id
                  ),
                  'artists',
                  (
                    SELECT
                      json_group_array(
                        json_object('id', art.id, 'name', art.name)
                      )
                    FROM
                      spotify_artists AS art
                      LEFT JOIN spotify_tracks_artists AS ta ON ta.artist_id = art.id
                    WHERE
                      ta.track_id = t.id
                  )
                )
              FROM
                spotify_tracks AS t
              WHERE
                t.id = tp.track_id
            )
          )
        )
      FROM
        spotify_tracks_playlists as tp
      WHERE
        tp.playlist_id = p.id
    )
  )
FROM
  spotify_playlists AS p
WHERE
  p.id = ?

```

Added bonus -- it compiles to plain SQL.
