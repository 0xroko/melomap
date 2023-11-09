import NextAuth, { AuthOptions, Session } from "next-auth";
import SpotifyProvider, { SpotifyProfile } from "next-auth/providers/spotify";

const SCOPES = [
  "user-library-read",
  "playlist-read-private",
  // "user-follow-read",
  "user-top-read",
  "user-read-recently-played",
];

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization:
        "https://accounts.spotify.com/authorize?scope=" + SCOPES.join("%2c"),
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, user, profile, session }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.id = (profile as SpotifyProfile).id;
        token.image = (profile as SpotifyProfile).images?.[0]?.url ?? undefined;
      }

      return token;
    },
    async session({ session, user, token }) {
      const sess = session as Session;

      sess.user.id = token.id as string;
      sess.user.accessToken = token.accessToken as string;
      sess.user.image = token.image as string | undefined;
      return session;
    },
  },
};

export default NextAuth(authOptions);
