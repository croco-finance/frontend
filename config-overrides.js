const { alias } = require('react-app-rewire-alias');

module.exports = function override(config) {
    alias({
        '@actions': 'src/store/actions',
        '@components': 'src/components',
        '@config': 'src/config',
        '@data': 'src/data',
        '@types': 'src/config/types.ts',
        '@utils': 'src/utils',
        '@views': 'src/views',
        '@actionTypes': 'src/store/actions/actionTypes',
        '@hooks': 'src/hooks',
        '@reducers': 'src/store/reducers',
        '@store': 'src/store',
    })(config);

    return config;
};
