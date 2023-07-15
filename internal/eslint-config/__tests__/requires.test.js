test('should require all eslint configs without error', () => {
	expect(() => {
		require('../index');
	}).not.toThrow();
	expect(() => {
		require('../globs');
	}).not.toThrow();
});
