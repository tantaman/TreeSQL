import { DB } from "@vlcn.io/wa-crsqlite";

export async function insert(db: DB) {
  await db.execMany([
    "insert into `spotify_playlists` (`collaborative`, `colors_string`, `description`, `id`, `name`, `owner_id`, `owner_name`) values (0, '[\"#809ca8\",\"#7c7c84\",\"#8cbccc\"]', 'The hardest hitting beats and morphing bass intricately interwoven with endless funk. Top of the playlist updated regularly. Check out my Neurotopia mixes at https:&#x2F;&#x2F;www.mixcloud.com&#x2F;StygSound&#x2F;', 'spotify:playlist:0BlYzw85HefWVEtvyTWFV2', 'Neurohop', 'stygsound', 'Ben Gravell')",
  ]);
}
