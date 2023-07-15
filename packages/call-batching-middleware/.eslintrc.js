/** @type {import('eslint').Linter.Config} */
const config = {
	extends: ['@moleculerjs/eslint-config-moleculer-middleware'],
	settings: {
		'import/resolver': 'typescript',
	},
	ignorePatterns: ['node_modules', 'dist', 'coverage', '**/*.d.ts', '!.*.js', '!.*.cjs', '!.*.mjs'],
};

module.exports = config;
