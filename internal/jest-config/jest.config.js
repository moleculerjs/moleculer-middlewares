const baseConfig = require('.');

/** @type {import('jest').Config} */
const jestConfig = {
	...baseConfig,
	collectCoverageFrom: [
		'**/!(*.spec|*.test).[jt]s?(x)', // js files
		'!.*.js', // not root dot-files
		'!*.config.js', // not root config files
	],
};

module.exports = jestConfig;
