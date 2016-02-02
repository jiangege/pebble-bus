gulp = require "gulp"
require "shelljs/global"

{spawn} = require "child_process"

cmdAsync = (args...) ->
  args.push {
    stdio: [
      process.stdin
      process.stdout
    ]
  }
  spawn.apply @, args

gulp.task "debug", ->
  console.log "😃 start debug..."
  cmdAsync "pebble", ["logs"]

  exec "
        pebble clean &&
        pebble build &&
        pebble install --emulator basalt -v
  "
  console.log "cool 🍻!!"
