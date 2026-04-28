import { defineConfig } from "rollup";
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';

export default defineConfig([
    {
        input: [ 
            "./src/bold.ts",
        ],
        output: {
            dir: "./dist",
            format: "es"
        },
        plugins: [ svelte() ]
    }
])