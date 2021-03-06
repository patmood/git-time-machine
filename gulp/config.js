var dest = "./build"
  , src = './src'


module.exports = {
  browserSync: {
    server: {
      // We're serving the src folder as well
      // for sass sourcemap linking
      baseDir: [dest, src]
    },
    files: [
      dest + "/**",
      // Exclude Map files
      "!" + dest + "/**.map"
    ]
  },
  images: {
    src: src + "/images/**",
    dest: dest + "/images"
  },
  markup: {
    src: src + "/htdocs/**",
    dest: dest
  },
  stylus: {
    entry: src + "/stylesheets/app.styl",
    src: src + "/stylesheets/**",
    dest: dest,
    options: {
      compress: false
    }
  },
  browserify: {
    src: src + "/javascripts/**",
    // Enable source maps
    debug: true,
    // Additional file extentions to make optional
    extensions: ['.coffee', '.hbs'],
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: './src/javascripts/app.js',
      dest: dest,
      outputName: 'app.js'
    }, {
      entries: './src/javascripts/head.js',
      dest: dest,
      outputName: 'head.js'
    }]
  }
};
