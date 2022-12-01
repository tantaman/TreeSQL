import { sql } from "composed-sql";
import sqliteWasm from "@vlcn.io/wa-crsqlite";

const sqlite = await sqliteWasm();
const db1 = await sqlite.open(":memory:");

await db1.execMany([
  `CREATE TABLE deck (id primary key, name);`,
  `CREATE TABLE slide (id primary key, "order", deck_id);`,
  `CREATE TABLE component (id primary key, text, slide_id);`,
  `CREATE INDEX slide_deck ON slide (deck_id);`,
  `CREATE INDEX comp_slide ON component (slide_id);`,
]);

await db1.execMany([
  `INSERT INTO deck VALUES (1, 'first');`,
  `INSERT INTO slide VALUES (1, 0, 1);`,
  `INSERT INTO slide VALUES (2, 1, 1);`,
  `INSERT INTO component VALUES (1, 'some text', 1);`,
  `INSERT INTO component VALUES (2, 'some other text', 1);`,
  `INSERT INTO component VALUES (3, 'some more text', 1);`,
]);

const r = await db1.execA(sql`
SELECT {
  id: deck.id,
  slides: [SELECT { 
    id: slide.id,
    order: slide."order",
    components: [SELECT {
      id: component.id,
      text: component.text
    } FROM component WHERE component.slide_id = slide.id]
  } FROM slide WHERE slide.deck_id = deck.id],
} FROM deck`);

console.log(r.map((s: any) => JSON.parse(s)));

const id = "1";
const trackArtists = /*sql*/ `(SELECT {
  id: art.id,
  name: art.name
} FROM spotify_arists AS art
  LEFT JOIN spotify_tracks_artists AS ta
  ON ta.artist_id = art.id
  WHERE ta.track_id = t.id)`;

// note:
// we can hoist sub-selects as fragments
// and make them reactive on the component that uses them.
// e.g., like Relay `useFragment` hooks.
const top = sql`
SELECT {
  tracks: [SELECT {
    addedAt: tp.added_at_timestamp,
    trackNumber: tp.track_index,
    track: (SELECT {
      id: t.id,
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
`;

// We could be more succicnt by:
// 1. omitting select
// 2. allow omitting alias names
// 3. omit from?? and put table name first?
// but 1 & 3 may make too unrecognizable from sql

let fragCount = 0;
// just allow literal and bind params? no interp?
function frag<T>(strings: TemplateStringsArray, ...values: any[]): Frag<T> {
  return {
    count: ++fragCount,
    // TODO: should shadow fields
    // or should de-dupe fields in the final composed query
    embedding: String.raw({ raw: strings }, ...values),
    standalone: "the embedding but as standalone",
    // ^- field only frags have no standalone?
    // the _simplest_ first pass would be to
    // not do any splitting and literally
    // re-run the whole composed query then _diff_
    // by frag.
    // - data comes in
    // - we mutate frag refs on props (yes, mutate a prop)
    // - useFrag listens to those refs
    // - useFrag diffs
    // - if different, set state
    //
    // can we rm react then? since react
    // will dom diff too
    // but if we data diff, why dom diff?
    // we are pretty sure what'll be touched.
    //
    // put db in worker for this approach?
  };
}

type Frag<T> = {
  embedding: string;
  standalone: string;
  count: number;
};

function include<T>(frag: Frag<T>) {
  return frag.embedding;
}

const albumFrag = frag`
  album: (SELECT a.name FROM spotify_albums AS a WHERE a.id = t.album_id),
`; // more ergonimic?
// ^-- gets re-written with frag id?
// useFrag(albumFrag, data.track);

// can only frag on fields
function useFrag<T>(fragment: Frag<T>, data: T) {
  // if there's a select we can hoist it separately?
  // and bind to it separately?
  // 1. run the query
  // 2. subscribe to it
  // 3. pull semantics from it
}

`spotify_playlists: [{
  tracks: [spotify_tracks_playlists {
    addedAt,
    trackNumber,
    track: (spotify_tracks {
      
    })
  }]
}]`;

console.log(top);
