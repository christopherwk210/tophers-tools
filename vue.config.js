const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
  transpileDependencies: true,
  chainWebpack: config => {
    config.module
      .rule('text-files')
        .test(/\.txt/)
        .type('asset/source')
  }
});
