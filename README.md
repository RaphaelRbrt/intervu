# Intervu

Intervu is a lightweight Vue 3 application for preparing technical interviews with a clean, fast UI. It lets you browse, search and filter questions by category, read highlighted answers rendered from Markdown, and quickly manage content via a simple GraphQL backend.

## Highlights

- Fast, modern UI built with Vite and Vue 3
- Markdown answers with code highlighting (highlight.js)
- Search and category filters are cumulative (AND logic)
- Per-question expand/collapse state persisted in localStorage
- Category drawer open state and selected category persisted
- Revalidation-friendly GraphQL client with an in-memory SWR-like cache
- Responsive layout tuned to the provided Figma proportions

## Tech Stack

- Vue 3 + Vite
- Vue Router
- GraphQL Client: `graphql-request`
- Styling: single-file component CSS (scoped), CSS variables for theming
- Syntax highlighting: `highlight.js`

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install

```sh
npm install
```

### Development

```sh
npm run dev
```

This starts the Vite dev server. The app expects a GraphQL endpoint (see Environment below).

### Production Build

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## Environment

Client configuration is driven by environment variables (via Vite):

- `VITE_API_URL` (optional): Base API URL. Examples: `https://api.example.com` or `/api`.
- `VITE_API_TOKENS` (optional): Token used by the GraphQL client (sent as `Authorization: Bearer <token>` when set).

If not provided, the client will default to `window.location.origin + '/api'` during runtime, and `http://localhost:3000/api` as a fallback in non-browser contexts.

## Project Scripts

- `dev`: Start the dev server
- `build`: Create an optimized production build
- `preview`: Preview the production build locally

## Key Architecture Notes

- GraphQL cache is an in-memory SWR-like mechanism that returns stale data fast and revalidates in the background when configured.
- Expandable headers are implemented via a reusable `ExpandableHeader` component; state (open/closed) is handled by parent components and persisted per question.
- Search and category filtering are combined on the client. Category selection is a toggle and is highlighted and persisted.

## Docker (optional)

A simple Dockerfile is included. Example usage:

```sh
docker build -t intervu .
docker run -p 3000:3000 intervu
```

Adjust the exposed port or environment variables as needed for your deployment.

## Troubleshooting

- GraphQL endpoint not reachable: verify `VITE_API_URL` (or that `/api` is correctly proxied/served).
- Module path alias errors: the project uses `@/*` mapped to `src/*` (see `jsconfig.json`). Ensure your tooling respects this.
- Missing or renamed components: `ExpandableHeader` replaces the legacy `ExpandedButton`. A small compat re-export exists at `src/components/ExpandedButton.vue`.

## License

This project is provided as-is for demonstration and educational purposes.

# intervu

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
