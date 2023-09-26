import { useAppState } from "@/lib/store";
import {
  Artist,
  ArtistData,
  ArtistRelation,
  PlaylistsApiResponse,
  RelatedArtistsResponse,
  Song,
  SpotifyPlaylistItems,
  TopArtistsResponse,
} from "@/lib/types";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import pLimit from "p-limit";

const BASE_SPOTIFY_URL = "https://api.spotify.com/v1";

// for fetching playlists (limited by spotify api)
const TRACK_LIMIT = 50;
// max number of related artists requests
const MAX_RELATED_REQUEST_COUNT = 1000;
// max number of related artists per artist
const RELATED_LIMIT = 23;
// max number of artists from playlists
const MAX_ARTISTS_FROM_PLAYLISTS = 500;
// max number of artists from saved tracks
const MAX_ARTISTS_FROM_SAVED = 500;

// fetch -> if 429 read `Retry-After` header and wait that long and try again
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  maxRetries = 2,
): Promise<Response> => {
  const res = await fetch(url, options);
  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    if (retryAfter) {
      const retryAfterSeconds = parseInt(retryAfter) * 1000;
      await new Promise((resolve) => setTimeout(resolve, retryAfterSeconds));
      return await fetchWithRetry(url, options, maxRetries - 1);
    }
  }
  let retries = 0;

  if (retries > maxRetries) return new Response(undefined);

  return res;
};

export const spotifyFetch = async (
  url: string,
  token: string,
  disableRedirect = false,
) => {
  const res = await fetchWithRetry(BASE_SPOTIFY_URL + url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    if (disableRedirect) throw new Error("Unauthorized");
    else signIn("spotify");
  }
  if (res.body === undefined) return undefined;

  const json = await res.json();
  return json;
};

const progressTracker = (onIncrement: (progress: number) => void) => {
  let doneCount = 0;
  let total = 1;

  return {
    setTotal: (t: number) => {
      total = t;
    },
    reset: () => {
      doneCount = 0;
      total = 1;
      onIncrement(0);
    },
    updateTotal: (t: number) => {
      total += t;
    },
    increment: () => {
      doneCount++;
      const progress = doneCount / total;
      onIncrement(progress);
      return progress;
    },
  };
};

export const fetchArtistData = async ({ session }: { session: Session }) => {
  const artists = new Map<string, Artist>();
  const artistsRelations: Array<ArtistRelation> = [];

  const playlistsSongs: Song[] = [];
  const fetchPromiseLimiter = pLimit(7);

  const fetchProgressTracker = progressTracker((progress) => {
    useAppState.getState().fetchProgress.set(progress);
  });

  const userSavedTracksCount =
    (await spotifyFetch(`/me/tracks?limit=1`, session.user.accessToken!))
      ?.total ?? 0;

  const userSavedTracksReqestCount = Math.ceil(
    userSavedTracksCount / TRACK_LIMIT,
  );

  useAppState.setState({ graphState: "FETCHING_USER_SAVED_TRACKS" });
  fetchProgressTracker.setTotal(userSavedTracksReqestCount);

  let artistsFromUserLimitReached = false;

  // get all songs from user saved tracks
  for (let i = 0; i < userSavedTracksReqestCount; i++) {
    const userSavedTracksReq = (await spotifyFetch(
      `/me/tracks?limit=${TRACK_LIMIT}&offset=${i * TRACK_LIMIT}`,
      session.user.accessToken!,
    )) as SpotifyPlaylistItems;

    const tracks = userSavedTracksReq?.items.map((t) => t.track);
    if (!tracks) continue;

    fetchProgressTracker.increment();

    playlistsSongs.push(...tracks);
    tracks?.forEach((song, i) => {
      song?.artists.forEach((artist) => {
        if (artists.size > MAX_ARTISTS_FROM_SAVED) {
          artistsFromUserLimitReached = true;
          return;
        }
        artists.set(artist.id, {
          id: artist.id,
          name: artist.name,
          type: "playlist",
        });
      });

      if (artistsFromUserLimitReached) return;
    });
    if (artistsFromUserLimitReached) break;
  }

  // get "all" playlists
  const playlistsReq = (await spotifyFetch(
    `/me/playlists?limit=${TRACK_LIMIT}&offset=0`,
    session.user.accessToken!,
  )) as PlaylistsApiResponse;

  const totalRequestCount = playlistsReq?.items?.reduce(
    (a, b) => a + b.tracks.total / TRACK_LIMIT,
    0,
  );

  useAppState.setState({ graphState: "FETCHING_PLAYLISTS" });
  fetchProgressTracker.reset();
  fetchProgressTracker.setTotal(totalRequestCount);

  // sort the playlists by number of tracks -> more likely to have relevant artists
  playlistsReq.items.sort((a, b) => b.tracks.total - a.tracks.total);

  const ARTIST_MAP_START_SIZE = artists.size;

  let artistsFromPlaylistsLimitReached = false;
  // get all songs from all playlists
  for (let i = 0; i < playlistsReq.items.length; i++) {
    if (artistsFromPlaylistsLimitReached) break;

    const playlist = playlistsReq.items[i];
    const numberOfReq = Math.ceil(playlist.tracks.total / TRACK_LIMIT);

    for (let j = 0; j < numberOfReq; j++) {
      if (artistsFromPlaylistsLimitReached) break;

      // go from end to start to get the most recent songs
      const playlistItems = (await spotifyFetch(
        `/playlists/${playlist.id}/tracks?limit=${TRACK_LIMIT}&offset=${
          (numberOfReq - j - 1) * TRACK_LIMIT
        }`,
        session.user.accessToken!,
      )) as SpotifyPlaylistItems;

      const tracks = playlistItems?.items.map((t) => t.track);

      if (!tracks) continue;

      fetchProgressTracker.increment();

      playlistsSongs.push(...tracks);
      tracks?.forEach((song, i) => {
        song.artists.forEach((artist) => {
          if (artistsFromPlaylistsLimitReached) return;

          const currentArtistCount = artists.size - ARTIST_MAP_START_SIZE;
          if (currentArtistCount > MAX_ARTISTS_FROM_PLAYLISTS) {
            artistsFromPlaylistsLimitReached = true;
            return;
          }

          artists.set(artist.id, {
            id: artist.id,
            name: artist.name,
            type: "playlist",
          });
        });
      });
    }
  }

  const timeRanges = ["short_term", "medium_term", "long_term"];

  const topArtistsPromises = timeRanges.map((timeRange) => {
    return fetchPromiseLimiter(async () => {
      const topArtistsReq = (await spotifyFetch(
        `/me/top/artists?limit=${RELATED_LIMIT}&offset=0&time_range=${timeRange}`,
        session.user.accessToken!,
      )) as TopArtistsResponse;

      const topArtists = topArtistsReq?.items;

      return topArtists || [];
    });
  });

  const topArtists = (await Promise.all(topArtistsPromises)).flat();

  topArtists.forEach((artist, i) => {
    artists.set(artist.id, {
      id: artist.id,
      name: artist.name,
      type: "top",
    });
  });

  // limit related artists requests to MAX_RELATED_FETCH_COUNT
  let artistArray = Array.from(artists.values());

  if (artistArray.length > MAX_RELATED_REQUEST_COUNT) {
    artistArray = artistArray.filter((t) => t.type === "top");

    if (artistArray.length > MAX_RELATED_REQUEST_COUNT) {
      artistArray = artistArray.slice(0, MAX_RELATED_REQUEST_COUNT);
    }
  }

  const relatedArtistsPromises = artistArray.map((artist) => {
    return fetchPromiseLimiter(async () => {
      const relatedArtistsReq = (await spotifyFetch(
        `/artists/${artist.id}/related-artists`,
        session.user.accessToken!,
      )) as RelatedArtistsResponse;

      const related = relatedArtistsReq?.artists;

      if (!related) return;

      for (let i = 0; i < related.length; i++) {
        const relatedArtist = related[i];

        // check if related artsit is already in the map and only save artist for top artists
        if (!artists.has(relatedArtist.id) && artist.type === "top") {
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
      }

      fetchProgressTracker.increment();
    });
  });

  useAppState.setState({ graphState: "FETCHING_RELATED_ARTISTS" });
  fetchProgressTracker.reset();
  fetchProgressTracker.setTotal(relatedArtistsPromises.length);

  await Promise.all(relatedArtistsPromises);

  playlistsSongs.forEach((song, i) => {
    const author = song.artists[0];
    const otherArtists = song.artists.slice(1);

    if (otherArtists.length > 0) {
      otherArtists.forEach(async (artistOther) => {
        // check if artists are related
        const related = artistsRelations.find(
          (n) =>
            (n.idA === author.id && n.idB === artistOther.id) ||
            (n.idA === artistOther.id && n.idB === author.id),
        );

        const type = related ? "both" : "colab";

        artistsRelations.push({
          idA: author.id,
          idB: artistOther.id,
          type: type,
        });
      });
    }
  });
  useAppState.setState({ graphState: "BUILDING" });

  artistArray = Array.from(artists.values());

  const artistDataFiltered = filterArtistData({
    artists: artistArray,
    artistsRelations,
  });

  return artistDataFiltered;
};

/**
 * Remove artists with no relations and remove relations with no artists
 */
export const filterArtistData = (
  {
    artists,
    artistsRelations,
  }: {
    artists: Artist[];
    artistsRelations: ArtistRelation[];
  },
  demo = false,
) => {
  const filteredArtistArray = artists.filter((artist) => {
    const relatedArtistsA = artistsRelations.filter(
      (n) => n.idA === artist.id,
    ).length;
    const relatedArtistsB = artistsRelations.filter(
      (n) => n.idB === artist.id,
    ).length;

    if (relatedArtistsB < 3) {
      if ((artist?.relPos ?? 1) > 2) {
        return false;
      }
    }

    // demo only
    if (demo) {
      if (relatedArtistsA + relatedArtistsB < 3 && relatedArtistsB < 1) {
        if ((artist?.relPos ?? 1) > 2) {
          return false;
        }
      }
    }

    return true;
  });

  // remove duplicate relations
  for (let i = 0; i < artistsRelations.length; i++) {
    const relation = artistsRelations[i];

    const duplicate = artistsRelations.find(
      (n) =>
        (n.idA === relation.idA && n.idB === relation.idB) ||
        (n.idA === relation.idB && n.idB === relation.idA),
    );

    if (duplicate && duplicate !== relation) {
      if (duplicate.type === "both") {
        relation.type = "both";
      }
      artistsRelations.splice(i, 1);
      i--;
    }

    // check if artist exists in the filtered array
    const artistA = filteredArtistArray.find((t) => t.id === relation.idA);
    const artistB = filteredArtistArray.find((t) => t.id === relation.idB);

    if (!artistA || !artistB) {
      artistsRelations.splice(i, 1);
      i--;
    }
  }

  return {
    artists: filteredArtistArray,
    artistsRelations,
  } as ArtistData;
};
