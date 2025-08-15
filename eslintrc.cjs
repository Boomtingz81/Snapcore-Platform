/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["import", "unused-imports"],
  extends: ["eslint:recommended", "plugin:import/recommended"],
  rules: {
    "no-duplicate-imports": "error",
    "import/no-unresolved": "error",
    "import/order": ["warn", { "newlines-between": "always" }],
    "unused-imports/no-unused-imports": "warn",
    "no-restricted-imports": [
      "error",
      {
        patterns: ["../*/*/*"] // discourage deep up-traversals (fragile paths)
      }
    ]
  },
  ignorePatterns: ["dev-inventory.json", "dist/", "build/", "public/"],
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] }
    }
  }
};
