const { join } = require('path');
const commonConfig = require('../../webpack.app.config');
const { merge } = require('webpack-merge');

module.exports = merge(commonConfig, {
  output: {
    path: join(__dirname, '../../dist/apps/auth'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
});
