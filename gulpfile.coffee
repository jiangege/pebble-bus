gulp = require('gulp-param')(require('gulp'), process.argv)
require "shelljs/global"
gulpLiveScript = require "gulp-livescript"
{spawn} = require "child_process"
watch = require "gulp-watch"

cmdAsync = (args...) ->
  args.push {
    stdio: [
      process.stdin
      process.stdout
    ]
  }
  spawn.apply @, args

gulp.task "ls-compile", ->
  gulp.src "#{__dirname}/js-src/**/*.ls"
    .pipe gulpLiveScript bare: true
    .pipe gulp.dest "#{__dirname}/src/js/"

build = (ip) ->
  exec "pebble build"
  cmdAsync "pebble", ["install", "--phone", ip, "--logs"]


gulp.task "debug", ["ls-compile"], build
