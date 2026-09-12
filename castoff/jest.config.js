module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['index.js'],
  coverageThreshold: {
    global: {
      lines: 75,
      functions: 75,
      branches: 75,
      statements: 75
    }
  }
};
