import { GraphData, LinkObject, NodeObject } from "react-force-graph-3d";

// if artist is from reccomendation or is in a playlist or one of top artists
export type ArtistType = "related" | "playlist" | "top";

export interface Artist {
  name: string;
  id: string;
  type: ArtistType;
  // relPos is the position of the artist in the related artists array
  relPos?: number;
  genres?: string[];
}

export interface Song {
  name: string;
  id: string;
  artists: Omit<Artist, "type">[];
}

export interface ArtistRelation {
  // A is the author in case of colab
  idA: Artist["id"];
  idB: Artist["id"];
  song?: {
    name: string;
    id: string;
  };
  type: "colab" | "related" | "both";
}

export interface Node extends NodeObject {
  label: string;
  type: Artist["type"];
  size: number;
  id: string;
}

export interface Link extends LinkObject<Node> {
  type: ArtistRelation["type"];
}

export type ExtendedGraphData = GraphData<Node, Link> & {
  // holds the relations between nodes
  nodeRelationsMap: Map<string, string[]>;
};

export type ArtistData = {
  artists: Artist[];
  artistsRelations: ArtistRelation[];
};

// ************************************************************ //
// ************************************************************ //
// Spotify API Response Types
export interface PlaylistsApiResponse {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items: Array<{
    collaborative: boolean;
    description: string;
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    name: string;
    owner: {
      external_urls: {
        spotify: string;
      };
      followers: {
        href: string;
        total: number;
      };
      href: string;
      id: string;
      type: string;
      uri: string;
      display_name: string;
    };
    public: boolean;
    snapshot_id: string;
    tracks: {
      href: string;
      total: number;
    };
    type: string;
    uri: string;
  }>;
}

export type SpotifyPlaylistItems = {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items: Array<{
    added_at: string;
    added_by: {
      external_urls: {
        spotify: string;
      };
      followers: {
        href: string;
        total: number;
      };
      href: string;
      id: string;
      type: string;
      uri: string;
    };
    is_local: boolean;
    track: {
      album: {
        album_type: string;
        total_tracks: number;
        available_markets: Array<string>;
        external_urls: {
          spotify: string;
        };
        href: string;
        id: string;
        images: Array<{
          url: string;
          height: number;
          width: number;
        }>;
        name: string;
        release_date: string;
        release_date_precision: string;
        restrictions: {
          reason: string;
        };
        type: string;
        uri: string;
        copyrights: Array<{
          text: string;
          type: string;
        }>;
        external_ids: {
          isrc: string;
          ean: string;
          upc: string;
        };
        genres: Array<string>;
        label: string;
        popularity: number;
        album_group: string;
        artists: Array<{
          external_urls: {
            spotify: string;
          };
          href: string;
          id: string;
          name: string;
          type: string;
          uri: string;
        }>;
      };
      artists: Array<{
        external_urls: {
          spotify: string;
        };
        followers: {
          href: string;
          total: number;
        };
        genres: Array<string>;
        href: string;
        id: string;
        images: Array<{
          url: string;
          height: number;
          width: number;
        }>;
        name: string;
        popularity: number;
        type: string;
        uri: string;
      }>;
      available_markets: Array<string>;
      disc_number: number;
      duration_ms: number;
      explicit: boolean;
      external_ids: {
        isrc: string;
        ean: string;
        upc: string;
      };
      external_urls: {
        spotify: string;
      };
      href: string;
      id: string;
      is_playable: boolean;
      linked_from: {};
      restrictions: {
        reason: string;
      };
      name: string;
      popularity: number;
      preview_url: string;
      track_number: number;
      type: string;
      uri: string;
      is_local: boolean;
    };
  }>;
};

export interface PlaylistItemsResponse {
  items: Array<{
    track: {
      artists: Array<{
        id: string;
        name: string;
      }>;
      id: string;
      name: string;
    };
  }>;
  next: string;
  total: number;
}

export interface RelatedArtistsResponse {
  artists: Array<{
    external_urls: {
      spotify: string;
    };
    followers: {
      href: any;
      total: number;
    };
    genres: Array<string>;
    href: string;
    id: string;
    images: Array<{
      height: number;
      url: string;
      width: number;
    }>;
    name: string;
    popularity: number;
    type: string;
    uri: string;
  }>;
}

export type TopArtistsResponse = {
  items: Array<{
    external_urls: {
      spotify: string;
    };
    followers: {
      href: any;
      total: number;
    };
    genres: Array<string>;
    href: string;
    id: string;
    images: Array<{
      height: number;
      url: string;
      width: number;
    }>;
    name: string;
    popularity: number;
    type: string;
    uri: string;
  }>;
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string;
  previous: any;
};
