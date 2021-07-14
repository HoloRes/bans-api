module.exports = {
  extends: [
    '@loopback/eslint-config',
  ],
	rules: {
		indent: ['error', 'tab'],
		'no-tabs': 'off',
		'no-plusplus': ['error', {
			allowForLoopAfterthoughts: true,
		}],
		'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'no-console': 'off'
	},
};
