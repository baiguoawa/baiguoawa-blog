import js from "@eslint/js";
import { globalIgnores } from "eslint/config";

export default [
  globalIgnores([".next/**", "dist/**", "node_modules/**", ".worktrees/**", ".backups/**", "backups/**"]),
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        FormData: "readonly",
        React: "readonly",
        console: "readonly",
        URL: "readonly",
        TextEncoder: "readonly",
        Event: "readonly",
        Element: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.jsx"],
    rules: {
      "no-unused-vars": "off",
    },
  },
];
