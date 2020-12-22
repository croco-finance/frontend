const { alias } = require('react-app-rewire-alias');

module.exports = function override(config) {
    alias({
        '@components': 'src/components',
        '@config': 'src/config',
        '@types': 'src/config/types.ts',
        '@utils': 'src/utils',
        '@views': 'src/views',
        '@actionTypes': 'src/store/actions/actionTypes',
        "@hooks": "src/hooks",
        "@actions": "src/store/actions",
        "@reducers": "src/store/reducers",
    })(config);

    return config;
};
