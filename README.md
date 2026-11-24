# kbn-proto-starter

The Kibana Prototype Starter: a starting point for coded Kibana prototypes. Click **Use this template** and you get your own repo with:

- **Kibana's chrome**: the header, side navigation and AI Agent panel from [kbn-proto-ui](https://github.com/elastic/kbn-proto-ui), built from Kibana's own code.
- **EUI and Elastic Charts**, ready to use, in light and dark.
- **Prototype settings**: a panel for switching what your prototype shows, with a few simple rules.
- **Deploys**: every push publishes your prototype to GitHub Pages.

The chrome and components come from packages, so they keep getting better with a version bump. Everything else is yours to change.

> [!IMPORTANT]
> **kbn-proto-starter or Kibana?**
>
> - **Small, scoped changes** to an existing page: work in [elastic/kibana](https://github.com/elastic/kibana). It's the fastest path to production.
> - **Quick exploration** of several directions, or **brand new features** that don't exist in Kibana yet: start here. Once a direction is settled, build it in Kibana.

## Get started

1. Click **Use this template** → **Create a new repository**.
2. Clone it and run:

```bash
npm install
```

```bash
npm run dev
```

3. Open http://localhost:5173.
4. Give it your prototype's name: change `name` in `package.json` (lowercase, with dashes, like `alerts-triage-prototype`) and the `<title>` in `index.html` (what the browser tab shows, like `Alerts triage`).

You need Node 22 or later (`nvm use` picks it up from `.nvmrc`).

## Where things are

| File | What it's for |
| --- | --- |
| `src/App.tsx` | Your pages and the Kibana chrome around them. |
| `src/pages/MyPage.tsx` | An example page. Replace it with yours. |
| `src/prototype/settings.ts` | Your prototype settings and their defaults. |
| `src/prototype/PanelContent.tsx` | The controls for those settings in the panel. |
| `src/prototype/PrototypeSettings.tsx` | The panel itself. You don't need to edit it. |

## Prototype settings

The button after the avatar opens the **Prototype settings** panel. It never uses Kibana's sidebar, so the AI Agent (or your own sidebar) can stay open next to it. It always sits outside Kibana, full height at the window's right edge.

At the top of the panel, next to Close:

- **The moon (or sun) button** switches to the dark (or light) theme.
- **The More menu (⋮)** holds **Placement** (two icon buttons): *Over the page* (the default) puts the panel on top of Kibana, which keeps its full width. *Beside the page* makes the whole Kibana frame room for it.

Your browser remembers the theme, where the panel opens and whether it was open. Add `?prototype=off` to the URL to hide the button and panel for screenshots and recordings.

To add your own setting:

1. **Declare it** in `src/prototype/settings.ts`: `showUpgradeBanner: false,`
2. **Add a row** in `src/prototype/PanelContent.tsx`: an `EuiFormRow` with `display="columnCompressed"` and a compressed EUI switch or select.
3. **Read it** in your page: `const { settings } = usePrototypeSettings();`

Keep the panel short and readable by someone who isn't on your project. See the guidelines in [AGENTS.md](AGENTS.md).

## Staying on EUI

Prototypes use EUI components and EUI theme tokens, with no custom styles, so they look like Kibana and work in light and dark. Most prototypes are built by AI agents, so the template checks this for you:

- **[AGENTS.md](AGENTS.md)** tells any agent (Claude Code, Cursor, Copilot, Codex) the rules.
- **`npm run check`** typechecks and runs the EUI rules in [eslint.config.js](eslint.config.js): Elastic's own [EUI lint rules](https://www.npmjs.com/package/@elastic/eslint-plugin-eui), plus no inline styles, class names, stylesheets, hard-coded colors or sizes, other UI libraries, or plain HTML where EUI has a component. Each message says what to use instead.
- **While `npm run dev` runs**, any break shows in a panel over the page. Tell your agent "fix the errors on screen".
- **In Claude Code**, every edit to `src/` is checked right away and Claude fixes what breaks ([.claude/settings.json](.claude/settings.json)).
- **Every commit** runs `npm run check` first (installed by `npm install`).
- **Every deploy** stops if the rules break, so the shared link only shows prototypes that pass.

If EUI really has nothing for what you need, ask your agent to explain the options before it builds something custom.

## Deploys

Every push publishes that branch as a version of your prototype. Several designers can work in the same repo, each on their own branches:

- **The site root lists every version:** `main` first, then the other branches, most recently updated first, with when and by whom.
- **`main`** is at `/main/`, every other branch at `/branches/<branch>/` (for example `/branches/empty-states/`).
- **Pushing** a branch updates only its version. **Deleting** a branch removes it.

Pull requests are optional: they don't change what's published. To clean up after merging, turn on **Settings → General → Automatically delete head branches**.

To turn deploys on, once per repo: **Settings → Pages → Source: GitHub Actions**. In a private or internal repo, you can limit the site to people in the organization under **Settings → Pages → Visibility**. To stop deploying, disable the workflow in the **Actions** tab.

## Upgrading

```bash
npm install github:elastic/kbn-proto-ui#<new version>
```

Releases are listed at [elastic/kbn-proto-ui](https://github.com/elastic/kbn-proto-ui/tags). EUI and Elastic Charts upgrade like any npm package.

## Vibe Kibana

This starter replaces Vibe Kibana. The original, with projects, templates, version history and comments, is kept at the [`v1.0.0`](https://github.com/elastic/vibe-kibana/tree/v1.0.0) tag.
