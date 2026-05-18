export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  moduleFileExtensions: ["ts", "js"],
  testPathIgnorePatterns: ["<rootDir>/test/uncommonCurrencies.test.ts"],
};
