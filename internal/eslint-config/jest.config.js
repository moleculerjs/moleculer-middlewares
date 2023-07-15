// this configuration cannot use the @moleculerjs/moleculer-middleware-jest-config as a base because it would create a cyclic dependency
/** @type {import('jest').Config} */
const jestConfig = {
	testEnvironment: 'node',
	testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
	resetMocks: true, // clear history and reset behavior of mocks between each test
	restoreMocks: true, // restore initial behavior of mocked functions
	coverageDirectory: 'coverage',
	collectCoverageFrom: [
		'**/!(*.spec|*.test).[jt]s?(x)', // js files
		'!.*.js', // not root dot-files
		'!*.config.js', // not root config files
	],
	coverageThreshold: {
		global: {
			statements: 100,
			branches: 100,
			functions: 100,
			lines: 100,
		},
	},
};

module.exports = jestConfig;
