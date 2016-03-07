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

  cmd = "pebble build && "
  cmd += if ip?
    "pebble install --phone #{ip}"
  else "pebble install --emulator basalt -v"
  exec cmd

gulp.task "debug", ["ls-compile"], (ip) ->
  exec "pebble kill"
  console.log "😃 start debug..."
  if build(ip)?.code is 0
    cmdAsync "pebble", ["logs"]
    if build(ip).code is 0
      watch "#{__dirname}/js-src/**/*.ls", (cb) ->
        gulp.src "#{__dirname}/js-src/**/*.ls"
          .pipe gulpLiveScript bare: true
          .on "error", console.error
          .pipe gulp.dest "#{__dirname}/src/js/"
          .on "end", -> build ip
      return console.log "Have fun 🍻!!"
  else
    console.log "😭"
