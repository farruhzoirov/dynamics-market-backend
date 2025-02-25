module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: ["plugin:@typescript-eslint/recommended", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
  },
};
