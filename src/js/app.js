var PP, Vector2, UI, NT_FULLSIZE, LifelineWin, LifelineCom, LifelineMsg, lifelineWin;
PP = require('./pre-processor');
Vector2 = require('vector2');
UI = require('ui');
/*
Lifeline =
  start: ->
    console.log "生命线游戏开始加载"

  loadStore: (storeStep) ->
    storeObj = PP.parse storeStep

    console.log JSON.stringify storeObj
*/
NT_FULLSIZE = new Vector2(144, 168 - 16);
LifelineWin = (function(){
  LifelineWin.displayName = 'LifelineWin';
  var prototype = LifelineWin.prototype, constructor = LifelineWin;
  function LifelineWin(arg$){
    var ref$, ref1$, this$ = this;
    ref$ = arg$ != null
      ? arg$
      : {}, this.dataList = (ref1$ = ref$.dataList) != null
      ? ref1$
      : [], this.comList = (ref1$ = ref$.comList) != null
      ? ref1$
      : [], this.oneScreeSize = (ref1$ = ref$.oneScreeSize) != null ? ref1$ : NT_FULLSIZE, this.scrollY = (ref1$ = ref$.scrollY) != null ? ref1$ : 0, this.movieYSpacing = (ref1$ = ref$.movieYSpacing) != null
      ? ref1$
      : NT_FULLSIZE.y, this.realHeight = (ref1$ = ref$.realHeight) != null ? ref1$ : 0;
    this.wind = new UI.Window;
    this.wind.on('click', 'down', function(){
      return this$.scrollBottom();
    });
    this.wind.on('longClick', 'down', function(){
      return this$.scrollBottom();
    });
    this.wind.on('click', 'up', function(){
      return this$.scrollUp();
    });
    this.wind.on('longClick', 'up', function(){
      return this$.scrollUp();
    });
  }
  prototype.show = function(){
    return this.wind.show();
  };
  prototype.update = function(){
    var i$, ref$, len$, i, com, results$ = [];
    this.calc();
    this.calcPosition();
    for (i$ = 0, len$ = (ref$ = this.comList).length; i$ < len$; ++i$) {
      i = i$;
      com = ref$[i$];
      results$.push(com.update());
    }
    return results$;
  };
  prototype.scrollBottom = function(){
    this.calcRealHeight();
    if (!(this.realHeight < NT_FULLSIZE.y)) {
      return;
    }
    if ((this.scrollY -= this.movieYSpacing) < NT_FULLSIZE.y - this.realHeight) {
      this.scrollY = NT_FULLSIZE.y - this.realHeight;
    }
    return this.update();
  };
  prototype.scrollUp = function(){
    if ((this.scrollY += this.movieYSpacing) > 0) {
      this.scrollY = 0;
    }
    return this.update();
  };
  prototype.calcRealHeight = function(){
    var i$, ref$, len$, i, com, results$ = [];
    this.realHeight = 0;
    for (i$ = 0, len$ = (ref$ = this.comList).length; i$ < len$; ++i$) {
      i = i$;
      com = ref$[i$];
      results$.push(this.realHeight += com.size.y);
    }
    return results$;
  };
  prototype.calc = function(){
    var i$, ref$, len$, i, com, beforeY, ref1$, ref2$, ref3$, beforeHeight, ref4$, ref5$, results$ = [];
    this.calcRealHeight();
    for (i$ = 0, len$ = (ref$ = this.comList).length; i$ < len$; ++i$) {
      i = i$;
      com = ref$[i$];
      beforeY = (ref1$ = (ref2$ = this.comList[i - 1]) != null ? (ref3$ = ref2$.pos) != null ? ref3$.y : void 8 : void 8) != null ? ref1$ : 0;
      beforeHeight = (ref1$ = (ref4$ = this.comList[i - 1]) != null ? (ref5$ = ref4$.size) != null ? ref5$.y : void 8 : void 8) != null ? ref1$ : 0;
      results$.push(com.position(new Vector2(0, beforeY + beforeHeight)));
    }
    return results$;
  };
  prototype.calcPosition = function(){
    var i$, ref$, len$, i, com, results$ = [];
    for (i$ = 0, len$ = (ref$ = this.comList).length; i$ < len$; ++i$) {
      i = i$;
      com = ref$[i$];
      results$.push(com.position(new Vector2(0, com.pos.y + this.scrollY)));
    }
    return results$;
  };
  prototype.add = function(data){
    data = clone$(data);
    data.size = this.oneScreeSize;
    data.pos = new Vector2(0, 0);
    this.comList.push((function(){
      switch (data.type) {
      case "msg":
        return new LifelineMsg(data);
      }
    }()));
    this.comList = this.comList.slice(-3);
    this.updateCom();
    this.dataList.push(data);
    return this.update();
  };
  prototype.updateCom = function(){
    var this$ = this;
    this.wind.each(function(e){
      return this$.wind.remove(e);
    });
    return this.comList.forEach(function(com){
      return com.comList.forEach(function(com){
        return this$.wind.add(com);
      });
    });
  };
  return LifelineWin;
}());
LifelineCom = (function(){
  LifelineCom.displayName = 'LifelineCom';
  var prototype = LifelineCom.prototype, constructor = LifelineCom;
  function LifelineCom(arg$){
    var size, pos, id;
    size = arg$.size, pos = arg$.pos, id = arg$.id;
    this.size = size;
    this.pos = pos;
    this.id = id;
    this.comList = [];
  }
  prototype.position = function(v){
    return this.pos = v;
  };
  return LifelineCom;
}());
LifelineMsg = (function(superclass){
  var prototype = extend$((import$(LifelineMsg, superclass).displayName = 'LifelineMsg', LifelineMsg), superclass).prototype, constructor = LifelineMsg;
  function LifelineMsg(data){
    LifelineMsg.superclass.call(this, data);
    this.rect = new UI.Rect({
      size: this.size,
      backgroundColor: 'yellow',
      borderColor: "green"
    });
    this.comList.push(this.rect);
  }
  prototype.update = function(){
    return this.rect.animate({
      position: new Vector2(0, this.pos.y)
    }, 100);
  };
  return LifelineMsg;
}(LifelineCom));
lifelineWin = new LifelineWin;
lifelineWin.add({
  id: "test",
  type: "msg",
  msg: "hello"
});
lifelineWin.add({
  id: "test1",
  type: "msg",
  msg: "hello"
});
lifelineWin.add({
  id: "test1",
  type: "msg",
  msg: "hello"
});
lifelineWin.show();
/*Lifeline.loadStore {
  id: "dw"
  wait: "5m"
  msg: "hello"
}*/
/*{
  id: "je;;p"
  msg: "hello"
  wait: "5s"
  select:  {
    "hello": "100"
  }
}*/
/*
win = new Window fullscreen: true


bgEle = new Rect {
  position: new Vector2 0, 0
  size: new Vector2 144, 168
  backgroundColor: "darkGray"
}

win.add bgEle
win.show!

console.log \run*/
function clone$(it){
  function fun(){} fun.prototype = it;
  return new fun;
}
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}