# Working on this prototype

This repo is a Kibana prototype built from kbn-proto-starter. Follow these rules when changing it.

## Name the prototype

If `package.json` is still named `kbn-proto-starter` or the `<title>` in `index.html` is still `Kibana Prototype Starter`, offer to rename them after the prototype before your first change: a lowercase, dashed `name` (like `alerts-triage-prototype`) and a readable title (like `Alerts triage`).

## Build with what exists

1. **Kibana's chrome comes from `@elastic/kbn-proto-ui`.** Use `KibanaChromeLayout`, `ChromeAppHeader`, `KibanaTabs` and the AI buttons as they come. Don't rebuild the header, side navigation or AI Agent, and don't wrap them in your own components.
2. **Use EUI, never custom styles.** See "Styling" below.
3. **Use Elastic Charts for charts,** with `LIGHT_THEME` / `DARK_THEME` following the prototype's theme, and the height in the `Chart`'s `size` prop (see `src/pages/MyPage.tsx`).
4. **Add pages in `src/App.tsx`** (`PAGES`), and their nav items through `navItems`. Nav ids follow Kibana's.
5. **Flyouts open inside Kibana's application area** automatically (`componentDefaults` in `src/App.tsx`), like in Kibana. Use a plain `EuiFlyout`; don't position flyouts by hand.
6. **Add only what the prototype needs.** No backend, routing library or state library unless the user asks for one.

## Styling

The person you're working with is most likely a designer who won't read the code. Prototypes must look like Kibana and work in light and dark, so styling follows this order. Take the first option that works:

1. **An EUI component and its props.** Padding, color, size, borders and alignment are usually props (`EuiPanel paddingSize`, `EuiText size`, `EuiButton color`). Look up the props in `node_modules/@elastic/eui` or https://eui.elastic.co before styling anything yourself.
2. **EUI layout components** for spacing and arrangement: `EuiFlexGroup`, `EuiFlexItem`, `EuiFlexGrid`, `EuiSpacer`, `EuiPanel`, `EuiHorizontalRule`.
3. **The `css` prop with EUI theme tokens** from `useEuiTheme()` (`euiTheme.size.m`, `euiTheme.colors.textSubdued`, `euiTheme.border.thin`), for what props can't do, like page padding or scrolling.

Never:

- inline `style`, `className`, or stylesheet imports (`.css`, `.scss`);
- hard-coded colors (hex, `rgb()`), sizes (`px`, `rem`, `em`), fonts or font sizes;
- plain `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`, `<label>`, `<table>`, `<hr>` or `<img>`: use the EUI component;
- other UI or icon libraries: use EUI and `EuiIcon`.

### When EUI doesn't have it

If EUI has nothing for what's needed, stop and tell the user in plain words what's missing and the options (the closest EUI component, or a custom piece and what it costs). Ask before adding any new library too. Wait for their OK.

Once they agree, build it and skip the rules only on the lines that need it, with a comment that says why:

```tsx
// eslint-disable-next-line -- EUI has no flow chart; approved by the user
```

Searching for "approved by the user" finds every exception. Never skip a rule without that approval, never skip whole files, and don't edit `eslint.config.js`.

## Prototype settings

Settings let people switch what the prototype shows. They live in `src/prototype/`:

- declare the setting and its default in `settings.ts`,
- add its control in `PanelContent.tsx`,
- read it with `usePrototypeSettings()`.

Don't edit `PrototypeSettings.tsx` unless the user asks.

Keep the panel lean:

- **One panel**, opened from the header button. Don't add popovers, nested flyouts or second panels to it. Its More menu is part of the frame.
- **Show only what applies** to the current page or step: wrap sections in a check on `currentPage`.
- **One `EuiFormRow` per setting, with `display="columnCompressed"`:** the label on the left, a compressed switch for on/off or a compressed select for choices on the right. Group rows under an `EuiTitle` (`xxs`). Use EUI components as they are; don't build your own rows or wrappers. No filled primary buttons, no info icons on every row.
- **Labels a stakeholder would understand:** "Show upgrade banner", not "bannerV2" or "Simulated states".
- **Remove a setting once its decision is made.** The panel is for open questions, not history.

## Branches

Every pushed branch is published as a version, and its name is what people see in the list of versions. When you create a branch, give it a short name that says what it explores, like `empty-states`. The list itself is part of the deploy: don't edit `.github/workflows/deploy.yml`, `scripts/`, `src/versions/`, `versions.html` or `vite.versions.config.ts`.

## Checks

Run `npm run check` before finishing, and fix everything it reports. It typechecks and checks the EUI rules in `eslint.config.js`; each message says what to use instead. The same check runs before every commit and every deploy, and a failing deploy doesn't publish.
