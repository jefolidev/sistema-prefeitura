import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
    { files: ["**/*.{ts}"] },
    { 
        languageOptions: { 
            globals: globals.node 
        }
    },
    {
        rules:{
            quotes: ["error", "double", { "allowTemplateLiterals": true }],
            indent: ["error", 4, { "SwitchCase": 1 }],
            // "object-property-newline": ["error", {
            //     "allowAllPropertiesOnSameLine": false
            // }],
            "max-len": ["error", {
                "code": 120,
                "ignoreComments": false,
                "ignoreTrailingComments": true,
                "ignoreUrls": true,
                "ignoreStrings": true,
                "ignoreTemplateLiterals": true,
                "ignoreRegExpLiterals": true
            }],
            "semi": ["error", "always"],
            "block-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "no-console": ["warn"],
            "no-unused-vars": ["error"],
        }
    },
    {
        ignores: ["dist/*", "prisma/*"]
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];