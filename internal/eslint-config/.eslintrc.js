const { jsTsGlobs } = require('./globs');

/** @type {import('eslint').Linter.Config} */
const config = {
	extends: ['./index'],
	overrides: [
		{
			files: jsTsGlobs,
			rules: {
				'global-require': 'off',
				'@typescript-eslint/no-var-requires': 'off',
			},
		},
	],
};

module.exports = config;
