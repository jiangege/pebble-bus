var Bus, UI, Settings, GenWin, NearLinesWin, StationDetailWin, BusesDetailWin, AlertWin, SplashScreenWin, BusUI;
Bus = require('bus');
UI = require('ui');
Settings = require('settings');
GenWin = (function(){
  GenWin.displayName = 'GenWin';
  var prototype = GenWin.prototype, constructor = GenWin;
  prototype.updateInv = 1000 * 15;
  prototype._updateInv = null;
  prototype.show = function(params){
    this.params = params != null
      ? params
      : {};
    return this.win.show();
  };
  prototype.hide = function(){
    return this.win.hide();
  };
  prototype.loaderrorCallback = function(){};
  prototype.onloaderror = function(cb){
    return this.loaderrorCallback = cb;
  };
  prototype.runUpdateTimer = function(){
    var this$ = this;
    this.stopUpdateTimer();
    return this._updateInv = setInterval(function(){
      return this$.load(function(){
        return this$.update();
      }, false);
    }, this.updateInv);
  };
  prototype.stopUpdateTimer = function(){
    return clearInterval(this._updateInv);
  };
  function GenWin(){}
  return GenWin;
}());
NearLinesWin = (function(superclass){
  var prototype = extend$((import$(NearLinesWin, superclass).displayName = 'NearLinesWin', NearLinesWin), superclass).prototype, constructor = NearLinesWin;
  function NearLinesWin(){
    var this$ = this;
    this.win = new UI.Menu({
      backgroundColor: 'white',
      textColor: 'black',
      highlightBackgroundColor: 'black',
      highlightTextColor: 'white'
    });
    this.win.on('select', function(e){
      if (this$.data != null) {
        return this$.selectCallback(this$.data[e.sectionIndex]);
      }
    });
    this.win.on('show', function(e){
      return this$.load(function(){
        return this$.update();
      });
    });
  }
  prototype.load = function(cb){
    var this$ = this;
    return Bus.getNearLines(function(err, lines){
      var collectionList, res$, i$, ref$, len$, i, v;
      if (err) {
        return this$.loaderrorCallback(err);
      }
      res$ = [];
      for (i$ = 0, len$ = (ref$ = Bus.collectionList()).length; i$ < len$; ++i$) {
        i = i$;
        v = ref$[i$];
        v.type = "collection";
        res$.push(v);
      }
      collectionList = res$;
      this$.data = collectionList.concat(lines);
      return cb();
    });
  };
  prototype.update = function(){
    var i$, ref$, len$, i, line, title, ref1$, ref2$, results$ = [];
    for (i$ = 0, len$ = (ref$ = this.data).length; i$ < len$; ++i$) {
      i = i$;
      line = ref$[i$];
      title = "";
      if (line.type === "collection") {
        title = "我的收藏";
      } else {
        title = "distance / " + line.distance + "m";
      }
      if (((ref1$ = this.win.section(i)) != null ? (ref2$ = ref1$.items[0]) != null ? ref2$.title : void 8 : void 8) !== line.sn) {
        results$.push(this.win.section(i, {
          title: title,
          items: [{
            title: line.sn
          }]
        }));
      }
    }
    return results$;
  };
  prototype.selectCallback = function(){};
  prototype.onselect = function(cb){
    return this.selectCallback = cb;
  };
  return NearLinesWin;
}(GenWin));
StationDetailWin = (function(superclass){
  var prototype = extend$((import$(StationDetailWin, superclass).displayName = 'StationDetailWin', StationDetailWin), superclass).prototype, constructor = StationDetailWin;
  function StationDetailWin(){
    var this$ = this;
    this.win = new UI.Menu({
      backgroundColor: 'white',
      textColor: 'black',
      highlightBackgroundColor: 'black',
      highlightTextColor: 'white'
    });
    this.win.on('select', function(e){
      var ref$;
      if (((ref$ = this$.data) != null ? ref$.lines[e.sectionIndex - 1] : void 8) != null) {
        return this$.selectCallback(this$.data.lines[e.sectionIndex - 1]);
      }
    });
    this.win.on('show', function(e){
      return this$.load(function(){
        return this$.update();
      });
    });
  }
  prototype.load = function(cb){
    var this$ = this;
    return Bus.getStationDetail(this.params.line, function(err, detail){
      if (err) {
        return this$.loaderrorCallback(err);
      }
      this$.data = detail;
      return cb();
    });
  };
  prototype.update = function(){
    var i$, ref$, len$, i, line, desc, ref1$, ref2$, results$ = [];
    for (i$ = 0, len$ = (ref$ = this.data.lines).length; i$ < len$; ++i$) {
      i = i$;
      line = ref$[i$];
      if (i === 0) {
        results$.push(this.win.section(i, {
          title: this.data.sn,
          items: []
        }));
      } else {
        desc = line.desc ? "(" + line.desc + ")" : "";
        if (((ref1$ = this.win.section(i)) != null ? (ref2$ = ref1$.items[0]) != null ? ref2$.title : void 8 : void 8) !== line.name + " " + desc) {
          results$.push(this.win.section(i, {
            title: line.firstTime + " - " + line.lastTime,
            items: [{
              title: line.name + " " + desc,
              subtitle: line.startSn + " -> " + line.endSn
            }]
          }));
        }
      }
    }
    return results$;
  };
  prototype.selectCallback = function(){};
  prototype.onselect = function(cb){
    return this.selectCallback = cb;
  };
  return StationDetailWin;
}(GenWin));
BusesDetailWin = (function(superclass){
  var prototype = extend$((import$(BusesDetailWin, superclass).displayName = 'BusesDetailWin', BusesDetailWin), superclass).prototype, constructor = BusesDetailWin;
  function BusesDetailWin(){
    var this$ = this;
    this.win = new UI.Card({
      scrollable: true
    });
    this.win.on('show', function(e){
      this$.load(function(){
        return this$.update();
      });
      return this$.runUpdateTimer();
    });
    this.win.on('hide', function(e){
      return this$.stopUpdateTimer();
    });
    this.win.on('click', 'select', function(e){
      var ref$;
      if (this$.data == null) {
        return;
      }
      this$.data.hasCollection = !this$.data.hasCollection;
      if (this$.data.hasCollection) {
        Bus.joinCollection((ref$ = this$.params.line, ref$.sn = this$.data.name, ref$));
      } else {
        Bus.removeCollection(this$.params.line.lineId);
      }
      return this$.updateCollection();
    });
  }
  prototype.load = function(cb, formShow){
    var ref$, this$ = this;
    formShow == null && (formShow = true);
    if (formShow) {
      console.log(JSON.stringify(this.params));
      return Bus.getLineDetail(this.params.line, function(err, detail){
        if (err) {
          return this$.loaderrorCallback(err);
        }
        this$.data = (detail.hasCollection = !!Bus.hasCollection(this$.params.line.lineId), detail);
        return cb();
      });
    } else if (this.data) {
      return Bus.updateBusesDetail((ref$ = import$({}, this.params.line), ref$.flpolicy = this.data.flpolicy, ref$), function(err, detail){
        if (err) {
          return this$.loaderrorCallback(err);
        }
        import$(this$.data, detail);
        return cb();
      });
    }
  };
  prototype.update = function(){
    var subtitleStr, lastTravelTime;
    this.win.title(this.data.name + " 需要" + this.data.price);
    this.updateCollection();
    subtitleStr = "";
    if (this.data.desc != null && this.data.desc.trim() !== "") {
      subtitleStr = this.data.depDesc || this.data.desc;
    } else if (this.data.lastTravelTime !== -1) {
      if (this.data.lastTravelTime < 60) {
        subtitleStr = this.data.lastTravelTime + "秒";
      } else {
        lastTravelTime = Math.round(this.data.lastTravelTime / 60);
        subtitleStr = lastTravelTime + "分钟";
      }
    }
    this.win.subtitle(subtitleStr);
    return this.win.body("" + this.data.firstTime + " - " + this.data.lastTime + "\n" + this.data.startSn + " -> " + this.data.endSn);
  };
  prototype.updateCollection = function(){
    var title;
    title = this.win.title();
    return this.win.title(title.replace("(已收藏)", "") + (this.data.hasCollection ? "(已收藏)" : ""));
  };
  return BusesDetailWin;
}(GenWin));
AlertWin = (function(superclass){
  var prototype = extend$((import$(AlertWin, superclass).displayName = 'AlertWin', AlertWin), superclass).prototype, constructor = AlertWin;
  function AlertWin(){
    var this$ = this;
    this.win = new UI.Card({
      scrollable: true
    });
    this.win.on('show', function(e){
      return this$.update();
    });
  }
  prototype.update = function(){
    var type;
    type = this.params.type;
    if (type === 0) {
      this.win.title("提示");
    } else if (type === 1) {
      this.win.title("警告");
    } else if (type === 3) {
      this.win.title("错误!!");
    }
    return this.win.body(this.params.info);
  };
  return AlertWin;
}(GenWin));
SplashScreenWin = (function(superclass){
  var prototype = extend$((import$(SplashScreenWin, superclass).displayName = 'SplashScreenWin', SplashScreenWin), superclass).prototype, constructor = SplashScreenWin;
  function SplashScreenWin(){
    var this$ = this;
    this.win = new UI.Card({
      scrollable: true,
      title: "加载中..."
    });
    this.win.on('show', function(){
      return this$.load();
    });
  }
  prototype.load = function(){
    var this$ = this;
    return Bus.auth(function(err){
      if (err) {
        return this$.loaderrorCallback(err);
      }
      return this$.loadsuccessCallback();
    });
  };
  prototype.loadsuccessCallback = function(){};
  prototype.onloadsuccess = function(cb){
    return this.loadsuccessCallback = cb;
  };
  return SplashScreenWin;
}(GenWin));
BusUI = {
  wins: {
    nearLinesWin: new NearLinesWin,
    stationDetailWin: new StationDetailWin,
    busesDetailWin: new BusesDetailWin,
    alertWin: new AlertWin,
    splashScreenWin: new SplashScreenWin
  },
  init: function(){
    var i$, ref$, this$ = this;
    for (i$ in ref$ = this.wins) {
      (fn$.call(this, i$, ref$[i$]));
    }
    this.wins.splashScreenWin.onloadsuccess(function(){
      this$.wins.nearLinesWin.show();
      this$.wins.splashScreenWin.hide();
      return this$.wins.nearLinesWin.onselect(function(line){
        if (line.type === 'collection') {
          this$.wins.busesDetailWin.show({
            line: line
          });
        } else {
          this$.wins.stationDetailWin.show({
            line: line
          });
        }
        return this$.wins.stationDetailWin.onselect(function(line){
          return this$.wins.busesDetailWin.show({
            line: line
          });
        });
      });
    });
    return this.wins.splashScreenWin.show();
    function fn$(i, win){
      var this$ = this;
      win.onloaderror(function(error){
        win.hide();
        return this$.wins.alertWin.show({
          type: 3,
          info: error.message
        });
      });
    }
  }
};
BusUI.init();
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