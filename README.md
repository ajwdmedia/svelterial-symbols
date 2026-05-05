# @ajwdmedia/svelterial-symbols

Svelte + Material Symbols ❤️  

Copies SVG components from @material-symbols/svg-200, @material-symbols/svg-400, and @material-symbols/svg-700 and creates Svelte components  
Also see sister project [@ajwdmedia/svelterial-icons](https://github.com/ajwdmedia/svelterial-icons)

**BREAKING - This package is now Svelte 5 Only**  
If you need Svelte 4 support, you must use [@ajwdmedia/svelterial-icons](https://github.com/ajwdmedia/svelterial-icons) or backtrack to v0.3.0, which has a different API.  

### Packages:
```sh
npm install @ajwdmedia/svelterial-symbols-light
npm install @ajwdmedia/svelterial-symbols
npm install @ajwdmedia/svelterial-symbols-bold
```

### Quirks
Files should be named the same as on the [Material Symbols site](https://fonts.google.com/icons?icon.set=Material+Symbols), however PascalCased  
Icon names that start with numbers have "Icon" preceeding them (`1k Plus => Icon1kPlus.svelte`)  
Icons are also available in Light (200) and Bold (700) widths, and are available on NPM in different packages (see above)

Icons are grouped by style (Outlined, Rounded, Sharp), and Filled Variants (OutlinedFilled, ...)  
Import the style, then use the new dot notation syntax to access each icon (similar to how threlte works)  
In theory, any unused icons should be stripped from your final bundle. In theory.  
```svelte
<script>

    import { Outlined } from "@ajwdmedia/svelterial-symbols"

</script>

<Outlined.Person fill="black" size="1.25em" />
```

### License
*(Copied from [marella/material-symbols](https://github.com/marella/material-symbols))*   
Material Symbols are created by [Google](https://github.com/google/material-design-icons#license)
>We have made these icons available for you to incorporate into your products under the [Apache License Version 2.0](https://github.com/marella/material-symbols/blob/main/svg/400/LICENSE). Feel free to remix and re-share these icons and documentation in your products. We'd love attribution in your app's about screen, but it's not required.
