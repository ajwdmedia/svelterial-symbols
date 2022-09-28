# @ajwdmedia/svelterial-symbols

Svelte + Material Symbols ❤️  

Copies SVG components from @material-symbols/svg-400 and @material-symbols/svg-700 and creates Svelte components  
Also see sister project [ajwdmedia/svelterial-icons](https://github.com/ajwdmedia/svelterial-icons)

### Quirks
Files should be named the same as on the [Material Icons site](https://fonts.google.com/icons?icon.set=Material+Icons), however PascalCased  
Icon names that start with numbers have "Icon" preceeding them (`1k Plus => Icon1kPlus.svelte`)  
Icons are also grouped by style (Outline, Filled, etc) - if you're using a lot of icons from the same group consider setting up a vite alias to them (eg `@ajwdmedia/svelterial-icons/Outlined/Person.svelte => %icons/Person.svelte`)  

### License
*(Copied from [marella/material-symbols](https://github.com/marella/material-symbols))*   
Material Symbols are created by [Google](https://github.com/google/material-design-icons#license)
>We have made these icons available for you to incorporate into your products under the [Apache License Version 2.0](https://github.com/marella/material-symbols/blob/main/svg/400/LICENSE). Feel free to remix and re-share these icons and documentation in your products. We'd love attribution in your app's about screen, but it's not required.
