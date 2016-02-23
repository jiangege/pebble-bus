class PreProcessor
  (obj) -> @obj = @exec ^^obj
  exec: (obj) ->
    robj = {}
    for key, val of obj
      if (fn = @fns[key])?
        unless val instanceof Array then val = [val]
        if (temp = fn.apply @, val)?
          robj <<< temp
      else
        robj[key] = val
    robj
  condition: (con, obj, rk)->
    return unless /^((\w)|(\s)|(\))|(\()|(=)|(\+)|(-)|(\/)|(\*))+$/.test con
    con =  "return !!(#{con});"
    fn = new Function con
    if @[rk] = fn.call @ then @exec obj
  fns:
    set: (obj) !->
      @vars <<< obj
    unset: (obj) !->
      for v in obj then delete obj[v]
    if: (con, obj) -> @condition con, obj, \ifResult
    elseif: (con, obj) -> unless @ifResult then @condition con, obj, \elseifResult
    else: (obj) ->  unless @ifResult or @elseifResult then obj


PreProcessor::vars = {}
PreProcessor.parse = -> (new PreProcessor ...).obj

module.exports = PreProcessor
