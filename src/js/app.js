var Bus, UI, Settings, Vector2, GenWin, NearLinesWin, StationDetailWin, BusesDetailWin, AlertWin, SplashScreenWin, BusUI;
Bus = require('bus');
UI = require('ui');
Settings = require('settings');
Vector2 = require('vector2');
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
      }, true);
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
      highlightTextColor: 'white',
      sections: [{
        title: "加载中...",
        items: []
      }]
    });
    this.win.on('select', function(e){
      var index, i$, to$, i;
      index = e.itemIndex;
      this$.sectionIndex = e.sectionIndex;
      this$.itemIndex = e.itemIndex;
      for (i$ = 0, to$ = this$.sectionIndex; i$ < to$; ++i$) {
        i = i$;
        index += this$.win.state.sections[i].items.length;
      }
      if (this$.data != null) {
        return this$.selectCallback(this$.data[index]);
      }
    });
    this.win.on('show', function(e){
      return this$.load(function(){
        return this$.update();
      });
    });
  }
  prototype.refresh = function(){
    var this$ = this;
    return this.load(function(){
      return this$.update();
    });
  };
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
    var myCollectionItems, nearLineitems, nearLineSectionIndex, i$, ref$, len$, i, line, subtitle, sn;
    myCollectionItems = [];
    nearLineitems = [];
    nearLineSectionIndex = 0;
    for (i$ = 0, len$ = (ref$ = this.data).length; i$ < len$; ++i$) {
      i = i$;
      line = ref$[i$];
      subtitle = "";
      sn = line.sn;
      if (line.type === "collection") {
        myCollectionItems.push({
          title: sn + "路",
          subtitle: line.startSn + " -> " + line.endSn
        });
      } else {
        nearLineitems.push({
          title: sn,
          subtitle: "距离你 / " + line.distance + "米"
        });
      }
    }
    if (myCollectionItems.length > 0) {
      this.win.section(0, {
        title: "我的收藏",
        items: myCollectionItems
      });
      nearLineSectionIndex = 1;
    } else {
      this.win.section(1, {
        title: "",
        items: []
      });
    }
    this.win.section(nearLineSectionIndex, {
      title: "附近站点",
      items: nearLineitems
    });
    if (this.sectionIndex != null) {
      return this.win.selection(this.sectionIndex, this.itemIndex);
    }
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
      highlightTextColor: 'white',
      sections: [{
        title: "加载中...",
        items: []
      }]
    });
    this.win.on('select', function(e){
      var ref$;
      if (((ref$ = this$.data) != null ? ref$.lines[e.itemIndex] : void 8) != null) {
        return this$.selectCallback(this$.data.lines[e.itemIndex]);
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
    var items, res$, i$, ref$, len$, i, line, desc;
    res$ = [];
    for (i$ = 0, len$ = (ref$ = this.data.lines).length; i$ < len$; ++i$) {
      i = i$;
      line = ref$[i$];
      desc = line.desc ? "(" + line.desc + ")" : "";
      res$.push({
        title: line.name + "路 " + desc,
        subtitle: line.startSn + " -> " + line.endSn
      });
    }
    items = res$;
    return this.win.section(0, {
      title: this.params.line.sn,
      items: items
    });
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
      scrollable: true,
      title: "加载中..."
    });
    this.win.action("select", 'ICON_COLLECTION');
    this.win.on('show', function(e){
      this$.load(function(){
        return this$.update();
      });
      return this$.runUpdateTimer();
    });
    this.win.on('hide', function(e){
      return this$.stopUpdateTimer();
    });
    this.win.on('longClick', 'select', function(e){
      return console.log('longClick');
    });
    this.win.on('click', 'select', function(e){
      var ref$;
      if (this$.data == null) {
        return;
      }
      this$.data.hasCollection = !this$.data.hasCollection;
      if (this$.data.hasCollection) {
        Bus.joinCollection((ref$ = this$.params.line, ref$.sn = this$.data.name, ref$.endSn = this$.data.endSn, ref$.startSn = this$.data.startSn, ref$));
      } else {
        Bus.removeCollection(this$.params.line.lineId);
      }
      return this$.updateCollection();
    });
  }
  prototype.load = function(cb, isUpdating){
    var ref$, this$ = this;
    isUpdating == null && (isUpdating = false);
    if (!isUpdating) {
      return Bus.getLineDetail(this.params.line, function(err, detail){
        if (err) {
          this$.stopUpdateTimer();
          return this$.loaderrorCallback(err);
        }
        this$.data = (detail.hasCollection = !!Bus.hasCollection(this$.params.line.lineId), detail);
        return cb();
      });
    } else if (this.data) {
      return Bus.updateBusesDetail((ref$ = import$({}, this.params.line), ref$.flpolicy = this.data.flpolicy, ref$), function(err, detail){
        if (err) {
          return this$.stopUpdateTimer();
        }
        import$(this$.data, detail);
        return cb();
      });
    }
  };
  prototype.update = function(){
    var subtitleStr, lastTravelTime;
    this.win.title(this.data.name + "路");
    this.updateCollection();
    subtitleStr = "";
    if (this.data.desc != null && this.data.desc.trim() !== "") {
      subtitleStr = this.data.depDesc || this.data.desc;
    } else if (this.data.lastTravelTime !== -1) {
      if (this.data.lastTravelTime < 60) {
        subtitleStr = "距离到站约" + this.data.lastTravelTime + "秒";
      } else {
        lastTravelTime = Math.round(this.data.lastTravelTime / 60);
        subtitleStr = "距离到站约" + lastTravelTime + "分钟";
      }
    }
    this.win.subtitle(subtitleStr);
    return this.win.body("\n" + this.data.startSn + " -> " + this.data.endSn + "\n\n需准备车费: " + this.data.price + "\n\n运营时间: " + this.data.firstTime + " - " + this.data.lastTime);
  };
  prototype.updateCollection = function(){
    var title;
    title = this.win.title();
    return this.win.title(title.replace("\n(已收藏)", "") + (this.data.hasCollection ? "\n(已收藏)" : ""));
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
      title: "加载中...."
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
    var i$, ref$, loaded, this$ = this;
    for (i$ in ref$ = this.wins) {
      (fn$.call(this, i$, ref$[i$]));
    }
    loaded = false;
    this.wins.splashScreenWin.onloadsuccess(function(){
      if (loaded === true) {
        console.log("refresh");
        this$.wins.nearLinesWin.refresh();
      } else {
        this$.wins.nearLinesWin.show();
      }
      loaded = true;
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