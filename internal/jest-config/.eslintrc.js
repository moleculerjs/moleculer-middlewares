const { jsTsGlobs } = require('@moleculerjs/eslint-config-moleculer-middleware/globs');

/** @type {import('eslint').Linter.Config} */
const config = {
	extends: ['@moleculerjs/eslint-config-moleculer-middleware'],
	overrides: [
		{
			files: jsTsGlobs,
			rules: {
				'global-require': 'off',
			},
		},
	],
};

module.exports = config;
