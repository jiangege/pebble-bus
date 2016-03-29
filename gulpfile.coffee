gulp = require "gulp"
gulpLiveScript = require "gulp-livescript"


gulp.task "transfer", ->
  gulp.src "#{__dirname}/js-src/**/!(*.ls)"
    .pipe gulp.dest "#{__dirname}/src/js/"

gulp.task "ls-compile", ["transfer"], ->
  gulp.src "#{__dirname}/js-src/**/*.ls"
    .pipe gulpLiveScript bare: true
    .pipe gulp.dest "#{__dirname}/src/js/"
