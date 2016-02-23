var PreProcessor;
PreProcessor = (function(){
  PreProcessor.displayName = 'PreProcessor';
  var prototype = PreProcessor.prototype, constructor = PreProcessor;
  function PreProcessor(obj){
    this.obj = this.exec(clone$(obj));
  }
  prototype.exec = function(obj){
    var robj, key, val, fn, temp;
    robj = {};
    for (key in obj) {
      val = obj[key];
      if ((fn = this.fns[key]) != null) {
        if (!(val instanceof Array)) {
          val = [val];
        }
        if ((temp = fn.apply(this, val)) != null) {
          import$(robj, temp);
        }
      } else {
        robj[key] = val;
      }
    }
    return robj;
  };
  prototype.condition = function(con, obj, rk){
    var fn;
    if (!/^((\w)|(\s)|(\))|(\()|(=)|(\+)|(-)|(\/)|(\*))+$/.test(con)) {
      return;
    }
    con = "return !!(" + con + ");";
    fn = new Function(con);
    if (this[rk] = fn.call(this)) {
      return this.exec(obj);
    }
  };
  prototype.fns = {
    set: function(obj){
      import$(this.vars, obj);
    },
    unset: function(obj){
      var i$, len$, v;
      for (i$ = 0, len$ = obj.length; i$ < len$; ++i$) {
        v = obj[i$];
        delete obj[v];
      }
    },
    'if': function(con, obj){
      return this.condition(con, obj, 'ifResult');
    },
    elseif: function(con, obj){
      if (!this.ifResult) {
        return this.condition(con, obj, 'elseifResult');
      }
    },
    'else': function(obj){
      if (!(this.ifResult || this.elseifResult)) {
        return obj;
      }
    }
  };
  return PreProcessor;
}());
PreProcessor.prototype.vars = {};
PreProcessor.parse = function(){
  return (function(func, args, ctor) {
    ctor.prototype = func.prototype;
    var child = new ctor, result = func.apply(child, args), t;
    return (t = typeof result)  == "object" || t == "function" ? result || child : child;
  })(PreProcessor, arguments, function(){}).obj;
};
module.exports = PreProcessor;
function clone$(it){
  function fun(){} fun.prototype = it;
  return new fun;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}