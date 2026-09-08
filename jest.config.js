module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'mjs', 'json'],
  testMatch: ['**/tests/**/*.test.mjs'],
  transform: {},
  collectCoverageFrom: [
    'services/**/*.mjs',
    'middlewares/**/*.mjs',
    'routes/**/*.mjs',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary']
};
