# Svelte 5 + Material Symbols ❤️  

Enables easy icon usage from the Material set within Svelte 5.  
Uses [@material-symbols/svg-xxx](https://npmjs.com/package/@material-symbols/svg-400) as a base, extracts the svg paths, and exposes them over a Threlte-like API.  

These packages should now be kept up to date via Github Actions.

If you need Svelte 4 support, you must use [@ajwdmedia/svelterial-icons](https://github.com/ajwdmedia/svelterial-icons) or backtrack to v0.3.0, which has a different API.  

### Packages:
Icons are available in Light (200) and Bold (700) widths, and are available on NPM in different packages.

```sh
npm install @ajwdmedia/svelterial-symbols-light
npm install @ajwdmedia/svelterial-symbols
npm install @ajwdmedia/svelterial-symbols-bold
```

### Setup
To enable tree shaking & reduced build/bundle size, you must import each icon string individually and register them yourself. This also allows you to bring your own svg path strings and unify them into one display component.  
Icons have different import paths depending on style and filled-ness.  
Typescript should be able to handle autocomplete for you.  
Export the result of `useIcons` - this is your Svelte Component that can be used across the project.  

```ts
// $lib/icon.ts
import { useIcons } from "@ajwdmedia/svelterial-symbols";

import { Person, SomethingElse } from "@ajwdmedia/svelterial-symbols/outlined";
export const Icon = useIcons({ Person, SomethingElse });

// Alternate for development - this cannot be tree shaken and may cause massive build times and bundles
import * as icons from "@ajwdmedia/svelterial-symbols/outlined";
export const Icon = useIcons(icons);
```

### Svelte Usage
Access the previously set up icons using dot syntax on the component

```svelte
<script>
    import { Icon } from "$lib/icon";
</script>

<Icon.Person />
```

| Prop     | Type      | Usage |
| ----     | -------   | ----- |
| `svg`    | `string`  | SVG Path, required but automatically provided when using the .Path syntax |
| `size`   | `string?` | Valid CSS size, defaults to `1em` when not given |
| `width`  | `string?` | Width override for stretching icons. Matches `size` when not given. |
| `height` | `string?` | Height override for stretching icons. Matches `size` when not given. |
| `fill`   | `string?` | Sets fill, accepts a valid CSS colour. Defaults to match text colour via `currentColor` when not set. Anything starting with `--` will be assumed to be a css variable and automatically get wrapped with `var(...)` |


### Quirks
Files should be named the same as on the [Material Symbols site](https://fonts.google.com/icons?icon.set=Material+Symbols), and PascalCased where possible.  
Icon names that start with numbers have "Icon" preceeding them (`1k Plus => Icon1kPlus`)  

### License
*(Copied from [marella/material-symbols](https://github.com/marella/material-symbols))*   
Material Symbols are created by [Google](https://github.com/google/material-design-icons#license)
>We have made these icons available for you to incorporate into your products under the [Apache License Version 2.0](https://github.com/marella/material-symbols/blob/main/svg/400/LICENSE). Feel free to remix and re-share these icons and documentation in your products. We'd love attribution in your app's about screen, but it's not required.
