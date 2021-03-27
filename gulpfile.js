const gulp = require('gulp')
const twig = require('gulp-twig')
const sass = require('gulp-sass')
const sassGlob = require('gulp-sass-glob')
const plumber = require('gulp-plumber')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const browserSync = require('browser-sync')
const webpack = require('webpack');
const webpackstream = require('webpack-stream')
const del = require('del')
const merge = require('merge-stream')
const spritesmith = require('gulp.spritesmith')
const rename = require('gulp-rename')
const inject = require('gulp-inject')
const concat = require('gulp-concat')
const footer = require('gulp-footer')
const gulpif = require('gulp-if')
const eslint = require('gulp-eslint')
const htmlValidator = require('gulp-w3c-html-validator')
const config = require('./gulp.config')

let isDev = 'development'
let webpackconfig = require('./webpack.config')(isDev, config)
let now = new Date()

gulp.task('twig', () => {
  // load new data on update [config.data] content
  delete require.cache[require.resolve(`${config.data}`)]
  const data = require(config.data)(config)

  return gulp.src([`${config.src.root}/*.twig`])
    // Stay live and reload on error
    .pipe(plumber({
      handleError(err) {
        console.log(err);
        this.emit('end');
      },
    }))
    .pipe(twig({
      data,
    }))
    .on('error', function (err) {
      process.stderr.write(`${err.message}\n`);
      this.emit('end');
    })
    .pipe(htmlValidator({
      skipWarnings: true
    }))
    .pipe(gulp.dest(config.dist.root))
    .pipe(gulpif(!isDev, htmlValidator.reporter()))
    .pipe(browserSync.stream())
})

gulp.task('css', () => gulp.src([`${config.src.assets}/css/*.scss`])
  .pipe(sassGlob())
  .pipe(sass({ outputStyle: isDev ? 'nested' : 'compressed' }).on('error', sass.logError))
  .pipe(gulpif(!isDev, footer(`\n/* ${now} */`)))
  .pipe(gulp.dest(`${config.dist.assets}/css`))
  .pipe(browserSync.stream()))

gulp.task('js:lint', () => {
  return gulp.src([`${config.src.assets}/js/**/*.js`])
    .pipe(eslint(
      {
        rules: {
          "no-console": isDev ? 1 : 2
        }
      }
    ))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})
gulp.task('js:build', () => gulp
  .src([`${config.src.assets}/js/app.js`])
  .pipe(plumber())
  .pipe(webpackstream(webpackconfig, webpack))
  .pipe(rename((path) => {
    const cssReg = new RegExp('.css$')
    if (cssReg.test(path.basename) || cssReg.test(path.extname)) {
      path.dirname = './css'
    } else {
      path.dirname = './js'
    }
  }))
  .pipe(gulpif(!isDev, footer(`\n/* ${now} */`)))
  .pipe(gulp.dest(`${config.dist.assets}`))
  .pipe(browserSync.stream()))

gulp.task('js', gulp.series('js:lint', 'js:build'))

gulp.task('images', () => gulp.src([
  `${config.src.images}/**/*`,
  `!${config.src.images}/sprites-retina`,
  `!${config.src.images}/sprites`,
  `!${config.src.images}/sprites-retina/**`,
  `!${config.src.images}/sprites/**`,
])
  .pipe(newer(`${config.dist.images}`))
  .pipe(gulp.dest(`${config.dist.images}`))
  .pipe(plumber.stop()))

gulp.task('sprite', () => {
  const retinaSpriteData = gulp.src(`${config.src.images}/sprites-retina/*.*`)
    .pipe(spritesmith({
      retinaSrcFilter: [`${config.src.images}/sprites-retina/*@2x.png`],
      imgName: 'sprites-retina.png',
      retinaImgName: 'sprites-retina@2x.png',
      cssName: '_retinaSprites.css',
      padding: 5,
      imgPath: (`../images/sprites-retina.png?t=${(new Date()).getTime()}`),
      retinaImgPath: (`../images/sprites-retina@2x.png?t=${(new Date()).getTime()}`),
    }))

  const spriteData = gulp.src(`${config.src.images}/sprites/*.*`)
    .pipe(spritesmith({
      imgName: 'sprites.png',
      cssName: '_sprites.css',
      padding: 5,
      imgPath: (`../images/sprites.png?t=${(new Date()).getTime()}`),
    }))

  // Output our images
  const retinaSpritesImgStream = retinaSpriteData.img.pipe(gulp.dest(`${config.src.images}`));
  const spritesImgStream = spriteData.img.pipe(gulp.dest(`${config.src.images}`));

  // Concatenate our CSS streams
  const cssStream = merge(retinaSpriteData.css, spriteData.css)
    .pipe(concat('_all-sprites.scss'))
    .pipe(gulp.dest(`${config.src.assets}/css/base`));

  // Return a merged stream to handle all our `end` events
  return merge(retinaSpritesImgStream, spritesImgStream, cssStream);
})

gulp.task('imagemin', () => gulp.src([
  `${config.src.images}/**/*`,
  `!${config.src.images}/sprites-retina`,
  `!${config.src.images}/sprites`,
  `!${config.src.images}/sprites-retina/**`,
  `!${config.src.images}/sprites/**`,
])
  .pipe(
    imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          {
            removeViewBox: false,
            collapseGroups: true,
          },
        ],
      }),
    ])
  )
  .pipe(gulp.dest(`${config.src.images}`))
  .pipe(plumber.stop()))

gulp.task('fonts', () => {
  gulp.src([`${config.src.assets}/font/*.*`])
    .pipe(gulp.dest(`${config.dist.assets}/fonts`))
})

gulp.task('extras', () => {
  return gulp.src([
    `${config.src.assets}/**/*.*`,
    `!${config.src.assets.images}/**/*.*`,
    `!${config.src.assets}/css/**/*.*`,
    `!${config.src.assets}/js/**/*.*`,
    `!${config.src.assets}/fonts/**/*.*`,
  ]).pipe(gulp.dest(`${config.dist.assets}/`));
})

gulp.task('inject', () => gulp.src([`${config.dist.root}/*.html`])
  .pipe(inject(gulp.src([...config.dist.inject], { read: false }), { relative: true, quiet: true }))
  .pipe(gulp.dest([`${config.dist.root}`])))

gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: config.dist.root,
      directory: true,
      reloadOnRestart: false
    },
    https: true
  })
})

gulp.task('watch', () => {
  gulp.watch([`${config.src.root}/**/*.twig`], gulp.series('twig', 'inject'))
  gulp.watch([`${config.data}`], gulp.series('twig', 'inject'))
  gulp.watch([`${config.src.assets}/css/**/*.scss`], gulp.series('css'))
  gulp.watch([`${config.src.assets}/**/*.js`], gulp.series('js'))
  gulp.watch([`${config.src.images}/**/*`], gulp.series('images'))
  gulp.watch([`${config.src.images}/sprite/**/*`], gulp.series('sprite'))
  gulp.watch([`${config.src.images}/sprite-retina/**/*`], gulp.series('sprite'))
})

// Clean assets
gulp.task('clean', () => del([`${config.dist.root}`], {
  force: true
}))

gulp.task('env:dev', (done) => {
  isDev = true
  delete require.cache[require.resolve('./webpack.config')]
  webpackconfig = require('./webpack.config')(isDev, config)
  done()
})

gulp.task('env:prod', (done) => {
  isDev = false
  delete require.cache[require.resolve('./webpack.config')]
  webpackconfig = require('./webpack.config')(isDev, config)
  now = new Date()
  done()
})

gulp.task('serve', gulp.series('env:dev', 'clean', 'sprite', gulp.parallel('twig', 'css', 'js', 'images'), 'extras', 'inject', gulp.parallel('browser-sync', 'watch')))
gulp.task('build', gulp.series('env:prod', 'clean', 'sprite', gulp.parallel('twig', 'css', 'js', 'images'), 'extras', 'inject'))
gulp.task('default', gulp.series('build'))
