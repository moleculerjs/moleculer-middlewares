/** @typedef {'testMatch' | 'bail' | 'resetMocks' | 'restoreMocks' | 'coverageDirectory' | 'collectCoverageFrom' | 'coverageThreshold' | 'workerIdleMemoryLimit'} RequiredBaseProperties */

/** @type {import('ts-essentials').MarkRequired<import('jest').Config, RequiredBaseProperties>} */
const baseConfig = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: [
		'**/?(*.)+(spec|test).[jt]s?(x)',
		'!**/dist/**/*', // ignore dist
	],
	bail: true,
	resetMocks: true, // clear history and reset behavior of mocks between each test
	restoreMocks: true, // restore initial behavior of mocked functions
	coverageDirectory: 'coverage',
	reporters: ['default', 'github-actions'],
	collectCoverageFrom: [
		'**/src/**/!(*.spec|*.test).[jt]s?(x)', // js, jsx, ts, and tsx files in "src" folder
		'!**/node_modules/**', // not node_modules
		'!**/__mocks__/**', // not jest mocks
		'!**/test/**', // not any test helpers
		'!**/index.[jt]s?(x)', // not index export files
		'!**/*.d.ts', // not ambient declarations
		'!**/types/**/*.ts', // not type definitions (directory)
		'!**/*.types.ts', // not local type definitions
	],
	coverageThreshold: {
		global: {},
		'**/*.?([cm])[jt]s?(x)': {
			statements: 25,
			functions: 25,
			lines: 25,
		},
	},
	workerIdleMemoryLimit: '512M',
};

module.exports = baseConfig;
