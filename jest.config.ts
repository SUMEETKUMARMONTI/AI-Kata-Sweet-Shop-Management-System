import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js"],

  // ✅ FIX path aliases
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },

  // ✅ Ignore TS diagnostics for tests (Mongoose typing)
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: false,
      },
    ],
  },

  clearMocks: true,
};

export default config;
