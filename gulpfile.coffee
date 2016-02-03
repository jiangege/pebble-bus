gulp = require "gulp"
require "shelljs/global"
gulpLiveScript = require "gulp-livescript"
{spawn} = require "child_process"

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


gulp.task "debug", ["ls-compile"], ->
  console.log "😃 start debug..."
  cmdAsync "pebble", ["logs"]

  exec "
        pebble clean &&
        pebble build &&
        pebble install --emulator basalt -v
  "
  console.log "cool 🍻!!"
