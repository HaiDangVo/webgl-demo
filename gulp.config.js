const assets = 'assets'

module.exports = {
  assets,
  src: {
    root: `./src`,
    assets: `./src/${assets}`,
    images: `./src/${assets}/images`
  },
  dist: {
    root: `./dist`,
    assets: `./dist/${assets}`,
    images: `./dist/${assets}/images`,
    inject: [
      `./dist/${assets}/css/*.css`,
      `./dist/${assets}/js/*.js`,
      `./dist/${assets}/libs/*.*`
    ]
  },
  data: `./data/data.js`
}