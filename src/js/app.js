var PP, Vector2, toAry, Lifeline, LifelineWin, lifelineWin;
PP = require('./pre-processor');
Vector2 = require('vector2');
toAry = function(obj){
  var key, val, results$ = [];
  for (key in obj) {
    val = obj[key];
    results$.push({
      "key": key,
      "val": val
    });
  }
  return results$;
};
Lifeline = {
  start: function(){
    return console.log("生命线游戏开始加载");
  },
  loadStore: function(storeStep){
    var storeObj;
    storeObj = PP.parse(storeStep);
    return console.log(JSON.stringify(storeObj));
  }
};
/*
class StoreContiner
  show: ->
  update: ->
  add: ->
*/
LifelineWin = (function(){
  LifelineWin.displayName = 'LifelineWin';
  var prototype = LifelineWin.prototype, constructor = LifelineWin;
  function LifelineWin(arg$){
    var ref$, ref1$;
    ref$ = arg$ != null
      ? arg$
      : {}, this.dataList = (ref1$ = ref$.dataList) != null
      ? ref1$
      : [], this.currIndex = (ref1$ = ref$.currIndex) != null ? ref1$ : 0, this.screeSize = (ref1$ = ref$.screeSize) != null
      ? ref1$
      : new Vector2(144, 20), this.currY = (ref1$ = ref$.currY) != null ? ref1$ : 0;
    this.win = new window;
  }
  prototype.render = function(){};
  prototype.show = function(data){
    this.dataList.push(data);
    this.currIndex.concat(this.currData = this.dataList[this.currIndex]);
    this.currY = this.currIndex * this.screeSize.y;
    return this.render();
  };
  prototype.msg = function(msg){
    var msgObj;
    msgObj = {
      msg: msg,
      type: "msg"
    };
    this.dataList.push(msgObj);
    this.currIndex++;
    return this.render();
  };
  prototype.next = function(cb){};
  prototype.select = function(selectObj, cb){};
  return LifelineWin;
}());
lifelineWin = new LifelineWin;
lifelineWin.show({
  type: "msg",
  msg: "hello"
});
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