import { demoDataPath } from "@/lib/const";
import { filterArtistData, spotifyFetch } from "@/lib/spotify";
import {
  Artist,
  ArtistRelation,
  RelatedArtistsResponse,
  SpotifyPlaylistItems,
} from "@/lib/types";
import { writeFile } from "fs/promises";
import pLimit from "p-limit";

const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
if (!accessToken) throw new Error("no access token");

const outputPath = "public" + demoDataPath;

const playlists = [
  "37i9dQZEVXbMDoHDwVN2tF",
  // "37i9dQZEVXbLRQDuF5jeBp",
  // "37i9dQZF1DX7F6T2n2fegs",
  // "37i9dQZF1DXcBWIGoYBM5M",
  // "37i9dQZF1DXcRXFNfZr7Tp",
  // "37i9dQZEVXbLiRSasKsNU9",
  "37i9dQZEVXbNG2KDcFcKOF",
  // "37i9dQZF1DXcF6B6QPhFDv",
  // "37i9dQZF1DX4UtSsGT1Sbe",
  // "37i9dQZF1DXbYM3nMM0oPk",
  // "37i9dQZF1DX0XUsuxWHRQd",
  // "37i9dQZF1DX5Vy6DFOcx00",
  "37i9dQZF1DX0MLFaUdXnjA",
];

const main = async () => {
  const artists = new Map<string, Artist>();
  const artistsRelations = [] as ArtistRelation[];
  // fetch all the songs from the playlists

  const fetchPlaylist = async (url: string) => {
    const playlistData = (await spotifyFetch(
      url,
      accessToken,
      true,
    )) as SpotifyPlaylistItems;

    if (playlistData.next) {
      const strippedUrl = playlistData.next.replace(
        "https://api.spotify.com/v1",
        "",
      );

      await fetchPlaylist(strippedUrl);
    }

    // get all artists from the songs
    for (const item of playlistData?.items) {
      for (const artist of item.track.artists) {
        const isFirst = item.track.artists[0].id === artist.id;
        artists.set(artist.id, {
          id: artist.id,
          name: artist.name,
          type: "playlist",
        });

        if (!isFirst) {
          artistsRelations.push({
            idA: item.track.artists[0].id,
            idB: artist.id,
            type: "colab",
          });
        }
      }
    }
  };
  const fetchPromiseLimiter = pLimit(20);
  const relatedArtistPromises = [] as Promise<void>[];

  for (const playlist of playlists) {
    relatedArtistPromises.push(
      fetchPromiseLimiter(() =>
        fetchPlaylist(
          `/playlists/${playlist}/tracks?limit=50&fields=next%2Citems%28track%28name%2Cid%2Cartists%28id%2Cname%29%29%29`,
        ),
      ),
    );
  }

  await Promise.all(relatedArtistPromises);

  relatedArtistPromises.length = 0;
  // fetch related artist data for each song

  console.log("done fetching playlist data");

  for (let artist of Array.from(artists.values())) {
    relatedArtistPromises.push(
      fetchPromiseLimiter(async () => {
        const relatedArtists = (await spotifyFetch(
          `/artists/${artist.id}/related-artists`,
          accessToken,
          true,
        )) as RelatedArtistsResponse;

        relatedArtists.artists.forEach((relatedArtist, i) => {
          if (!artists.has(relatedArtist.id)) {
            artists.set(relatedArtist.id, {
              id: relatedArtist.id,
              name: relatedArtist.name,
              type: "related",
              relPos: i,
            });
          }

          artistsRelations.push({
            idA: artist.id,
            idB: relatedArtist.id,
            type: "related",
          });
        });
      }),
    );
  }

  await Promise.all(relatedArtistPromises);

  const artistArray = Array.from(artists.values());

  console.log({
    artists: artistArray.length,
    artistsRelations: artistsRelations.length,
  });

  const filteredArtistData = filterArtistData(
    {
      artists: artistArray,
      artistsRelations,
    },
    true,
  );

  console.log({
    artists: filteredArtistData.artists.length,
    artistsRelations: filteredArtistData.artistsRelations.length,
  });

  await writeFile(outputPath, JSON.stringify(filteredArtistData));
};

main();
