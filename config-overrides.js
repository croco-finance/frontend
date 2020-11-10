const {alias} = require('react-app-rewire-alias')

module.exports = function override(config) {
  alias({
    '@components': 'src/components',
    "@config": "src/config",
    "@utils": "src/utils",
    "@views": "src/views",
    "@actionTypes": "src/store/actions/actionTypes"

  })(config)

  return config
}