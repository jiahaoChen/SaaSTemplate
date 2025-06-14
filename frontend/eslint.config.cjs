// .eslintrc.js
const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const typescriptESLint = require("@typescript-eslint/eslint-plugin");
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = {
  root: true,
  // 基础规则集：JS 推荐 + TS 推荐
  extends: [
    js.configs.recommended,                // ESLint 推荐
    "plugin:@typescript-eslint/recommended" // @typescript-eslint 推荐
  ],
  parser: tsParser,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    project: "./tsconfig.json"
  },
  plugins: [
    "@typescript-eslint",
    "unused-imports"
  ],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    // 1. 移除所有未使用的 import
    "unused-imports/no-unused-imports": "error",

    // 2. 移除或标记所有未使用的变量／参数（自动删除即可）
    "unused-imports/no-unused-vars": [
      "error",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_"
      }
    ],

    // 3. 关闭 TS 自带的 unused 检查，让上面插件来接管
    "@typescript-eslint/no-unused-vars": "off",

    // 4. 其他冲突或不需要的规则
    "no-unused-vars": "off",        // 交给 typescript-eslint + unused-imports
    "no-undef": "off",
    
    // 5. 添加更严格的规则来捕获和自动修复更多问题
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-prototype-builtins": "error",
    "@typescript-eslint/ban-ts-comment": "warn",
    
    // 6. 允许空函数
    "@typescript-eslint/no-empty-function": "off"
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        // 针对 TSX/TS 的特殊规则
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-expressions": ["error", { 
          "allowShortCircuit": true, 
          "allowTernary": true 
        }],
        // 自动修复 TS6133 错误
        "@typescript-eslint/no-unused-vars": ["error", { 
          "vars": "all",
          "args": "after-used",
          "ignoreRestSiblings": true,
          "varsIgnorePattern": "^_",
          "argsIgnorePattern": "^_"
        }]
      }
    }
  ],
  // 确保 ESLint 可以修复文件
  fix: true,
  fixTypes: ["problem", "suggestion", "layout"]
};
