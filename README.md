# Melomap

Placing your music taste on the map.

[Try it out!](https://melomap.vercel.app)

https://github.com/0xroko/melomap/assets/55251261/40d1dac3-2732-4002-b2f0-ad9640988af0

## About

Melomap is fully interactive visual explorer of your favorite and soon-to-be favorite artists. All data is fetched and processed locally, so no worries about your privacy.

### Features

- Artist is more than a name - Preview artist's top tracks via Spotify Embed
- Explore related artists - Click on artist to highlight related artists
- Top and playlists - See your top artists and artists from your playlists
- Grouping - artists are automatically grouped just by their connections, physics does the rest

## Stack

- Next.js (React)
- force graph - patched [react-force-graph](https://github.com/vasturiano/react-force-graph) (three.js)
- [Zustand](https://github.com/pmndrs/zustand) - state management
- Tailwind CSS
- Vercel

## Possible improvements

- Cache related artists server-side to offload Spotify API (against Spotify ToS?)
- Group artists by genre
- Add friend's artists and see the overlap (export / import feature?)
