test('should require all jest configs without error', () => {
	expect(() => {
		require('../index');
	}).not.toThrow();
});
