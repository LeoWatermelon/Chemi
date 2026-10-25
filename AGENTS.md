# Chemi project requirements

## Simulation cards (user preference, applies to all future simulations)
Every simulation entry must use the shared simulation-card layout in dist/chemi.css: the simulation name at the top left, with a brief, accurate description of what the user does underneath. Keep the existing green visual style. Do not leave new simulation cards as name-only links.

Use this structure for every simulation card in dist/index.html:

```html
<a class="topic-tab simulation-card" href="#full-simulation-route">
  <span class="simulation-card-title">Simulation name</span>
  <span class="simulation-card-description">One short sentence describing the actual interaction.</span>
</a>
```

Topic and subtopic navigation cards are distinct from simulation cards and may remain name-only. When changing a simulation's behavior, update its card description to match. Before publishing, verify every simulation card has a nonempty title and description. Avoid adding instructions or explanations inside the simulation unless requested; these card descriptions are explicitly requested.

## Optional simulation information
Atomic Structure & Periodicity simulations use the shared simulation-info.js / .css control. Each article has data-simulation-info and one data-info-button in a sim-info-toolbar. Put optional numerical readouts, calculations and explanatory notes behind data-sim-info; keep default info closed. Preserve game inputs, essential question data, diagrams, graph axes and feedback. Dynamic visibility (such as mode-specific panels) must still apply when info is open. Reuse existing info buttons rather than adding duplicates.

## Simulation guides
Do not add Show info guides or buttons until the user requests them again. Preserve the separate Show data and Show details controls.

## GitHub commits after major updates
The project repository is https://github.com/LeoWatermelon/Chemi and its working branch is main.
After completing a major update requested by the user, run appropriate checks, then automatically commit and push the completed changes to main. Do not ask for a separate confirmation for this routine commit/push workflow. Use a concise, descriptive commit message. Read the current remote head before updating; preserve concurrent changes and never force-push or overwrite unrelated work. Never commit credentials, tokens, local runtime files, or unrelated artifacts. If GitHub access or branch rules block the push, report the blocker and retain the completed local work.
GitHub source updates and ChatGPT Sites publication are separate operations: a GitHub push alone does not update the live Site.
