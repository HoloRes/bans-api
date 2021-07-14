module.exports = {
  extends: [
    '@loopback/eslint-config',
    'airbnb-base'
  ],
	rules: {
		indent: ['error', 'tab'],
		'no-tabs': 'off',
		'no-plusplus': ['error', {
			allowForLoopAfterthoughts: true,
		}],
		'import/no-extraneous-dependencies': 'off',
        'import/prefer-default-export': 'off',
        'no-console': 'off',
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        'no-useless-constructor': 'off',
        'no-empty-function': 'off',
        'no-use-before-define': 'off',
	},
};
