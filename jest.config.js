
module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['**/src/**/*.{js,ts}'],
  "setupFilesAfterEnv": [
    "./jest.setup.js"
  ],
  forceExit: true,
};
