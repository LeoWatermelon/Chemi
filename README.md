# Chemi

Interactive high-school chemistry simulations and reaction-mechanism practice.

## Run locally

The application is a static website; no package installation or build step is required.

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000 in your browser.

## Project layout

- `dist/index.html`: simulation screens and navigation cards.
- `dist/navigation.js`: routes and parent navigation.
- `dist/*.js`, `dist/*.css`: simulations and shared interface styles.
- `AGENTS.md`: project conventions and the commit workflow.
- `.openai/hosting.json`: existing ChatGPT Sites deployment identity and static directory.

## Publication

The current website is hosted at https://chemi.shrewdswan17.chatgpt.site.
This repository stores the source. Pushing to GitHub does not automatically publish to ChatGPT Sites or enable GitHub Pages.

## Development

Follow `AGENTS.md`. Keep simulation cards descriptive, retain the green interface, and check the affected simulations before committing changes to `main`.
