// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  {
    // Only build output and vendored code. This list used to carry
    // `*.config.*`, which excluded every vite/vitest/playwright config in
    // the repo, and `docs/`, which is markdown and HTML eslint never had
    // an opinion about. Everything a human writes is now linted; see the
    // `lint` script for the matching path list.
    ignores: [
      "dist/",
      "build/",
      "node_modules/",
      "packages/*/dist/",
      "examples/*/dist/",
      "docs-out/",
      "storybook-static/",
      "coverage/",
      ".verify-snippets/",
      ".bio-route-probe*.mjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Build tooling and gate scripts run in Node, not a browser. Without
    // this every `console.log` and `process.exit` in scripts/ is a
    // no-undef error, which is why the whole directory sat outside the
    // lint scope. TypeScript files do not need it: tseslint's
    // eslint-recommended layer turns no-undef off for them, since tsc
    // already resolves identifiers.
    files: [
      "scripts/**/*.{js,mjs,cjs}",
      "*.{js,mjs,cjs}",
      "*.config.ts",
      "vite*.config.ts",
      "vitest*.config.ts",
      "playwright.config.ts",
      ".storybook/**",
    ],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    // Library, demo, example and test code never writes to the process
    // streams directly. A timing probe (`process.stderr.write("PROBE ...")`)
    // was committed in ScaleSurface.test.tsx because nothing here objected;
    // scripts/ and root configs are Node tooling and keep stdout/stderr.
    files: ["{src,packages,examples,tests}/**/*.{ts,tsx,js,mjs,cjs}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name='write'][callee.object.property.name=/^(stdout|stderr)$/][callee.object.object.name='process']",
          message:
            "No direct process.stdout/stderr writes outside scripts/ (stray debug probe). Assert on the value instead.",
        },
      ],
    },
  },
  prettier,
  storybook.configs["flat/recommended"],
);
