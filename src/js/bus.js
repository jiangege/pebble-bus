var CryptoJS, _, ajax, Settings, imei_gen, udid_gen, Bus;
CryptoJS = require('./components/crypto-js');
_ = require('lodash');
ajax = require('ajax');
Settings = require('settings');
imei_gen = require('imei');
udid_gen = require('udid');
Bus = {
  url: "http://api.chelaile.net.cn:7000",
  udid: null,
  key: "woqunimalegebi1234567890",
  request: function(arg$, cb){
    var method, ref$, path, params, opts, this$ = this;
    method = (ref$ = arg$.method) != null ? ref$ : "get", path = (ref$ = arg$.path) != null ? ref$ : "", params = arg$.params;
    cb == null && (cb = function(){});
    opts = {
      url: this.url + path,
      method: method,
      type: 'text',
      cache: false
    };
    if (method === "get") {
      opts.url += this.preFillParams(params);
    } else {
      opts.data = this.preFillParams(params, false);
    }
    console.log("Request " + method + " " + opts.url);
    return ajax(opts, function(data){
      var ref$, error;
      try {
        data = this$.handleRes(data);
        if (data.errmsg != null) {
          return cb(new Error(data.errmsg));
        } else if ((data != null ? (ref$ = data.jsonr) != null ? ref$.data : void 8 : void 8) != null) {
          return cb(null, data.jsonr.data);
        } else {
          return cb(new Error("无法解析数据"));
        }
      } catch (e$) {
        error = e$;
        return cb(error);
      }
    }, function(error){
      return cb(new Error("网络错误:" + error));
    });
  },
  handleRes: function(data){
    return JSON.parse(data.replace(/\*|#|(YGKJ)/gmi, ""));
  },
  preFillParams: function(params, isQuery){
    var initParams, paramsStr, i$;
    isQuery == null && (isQuery = true);
    initParams = {
      last_src: "app_baidu_as",
      s: "android",
      sign: this.cryptoSign(),
      push_open: 0,
      userId: this.userId(),
      geo_type: "gcj",
      wifi_open: 1,
      lchsrc: "icon",
      nw: "WIFI",
      vc: "50",
      sv: "5.1",
      v: "3.11.0",
      imei: this.IMEI(),
      udid: this.UDID(),
      clientId: this.UDID(),
      first_src: "app_baidu_as"
    };
    import$(initParams, this.coords());
    import$(initParams, this.cityInfo());
    import$(initParams, params);
    if (isQuery) {
      paramsStr = "?";
      for (i$ in initParams) {
        (fn$.call(this, i$, initParams[i$]));
      }
      return paramsStr;
    } else {
      return initParams;
    }
    function fn$(k, v){
      if (paramsStr.length > 1) {
        paramsStr += "&";
      }
      paramsStr += k + "=" + encodeURIComponent(v);
    }
  },
  UDID: function(){
    var udid;
    Settings.option("udid", udid = Settings.option("udid") || udid_gen());
    return udid;
  },
  IMEI: function(){
    var imei;
    Settings.option("imei", imei = Settings.option("imei") || imei_gen());
    return imei;
  },
  cryptoSign: function(key){
    var keyHex, encrypted;
    keyHex = CryptoJS.enc.Utf8.parse(key || this.key);
    encrypted = CryptoJS.TripleDES.encrypt("" + Date.now(), keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  },
  userId: function(){
    return Settings.option("userId") || "unknown";
  },
  coords: function(){
    return Settings.option("coords") || {};
  },
  cityInfo: function(){
    var cityInfo;
    if ((cityInfo = Settings.option("cityInfo")) != null) {
      return {
        gen_lat: cityInfo.lat,
        gen_lng: cityInfo.lng,
        cityId: cityInfo.cityId
      };
    } else {
      return {};
    }
  },
  getCurrentLocation: function(cb){
    var coordsCache, this$ = this;
    coordsCache = this.getCache('coords', cb);
    return navigator.geolocation.getCurrentPosition(function(pos){
      var lat, ref$, lng, ref1$, coords;
      if ((lat = pos != null ? (ref$ = pos.coords) != null ? ref$.latitude : void 8 : void 8) != null && (lng = pos != null ? (ref1$ = pos.coords) != null ? ref1$.longitude : void 8 : void 8) != null) {
        coords = {
          enableHighAccuracy: true,
          lat: lat,
          lng: lng
        };
        return this$.setCache('coords', coords, cb);
      } else {
        return cb(new Error("无法获取位置,请检查gps开关"));
      }
    }, function(){
      return cb(new Error("无法获取位置,请检查gps开关"));
    }, {
      maximumAge: 10000,
      timeout: 10000
    });
  },
  getUserID: function(cb){
    var useId;
    if ((useId = Settings.option("userId")) == null) {
      return this.request({
        path: "/wow/user!create.action"
      }, function(err, data){
        var userid, ref$;
        if (err) {
          return cb(err);
        }
        if ((userid = (ref$ = data.userinfo) != null ? ref$.userId : void 8) != null) {
          Settings.option("userId", userid);
          return cb(null, userid);
        } else {
          return cb(new Error("无法获取user Id"));
        }
      });
    } else {
      return cb(null, useId);
    }
  },
  getCurrentCity: function(cb){
    var cityCache, this$ = this;
    cityCache = this.getCache('cityInfo', cb);
    return this.request({
      path: "/goocity/city!localCity.action"
    }, function(err, data){
      var ref$, localCity, cityInfo;
      if (err) {
        return cb(err);
      }
      if (((ref$ = localCity = data.localCity) != null ? ref$.cityId : void 8) !== "") {
        cityInfo = {
          cityId: localCity.cityId,
          cityName: localCity.cityName,
          lat: localCity.lat,
          lng: localCity.lng
        };
        return this$.setCache('cityInfo', cityInfo, cb);
      } else {
        return cb(new Error("暂不支持该城市"));
      }
    });
  },
  auth: function(cb){
    var this$ = this;
    return this.getUserID(function(err, userId){
      console.log("获得用户id" + userId);
      if (err) {
        return cb(err);
      }
      return this$.getCurrentLocation(function(err, coords){
        console.log("获得当前坐标" + JSON.stringify(coords));
        if (err) {
          return cb(err);
        }
        return this$.getCurrentCity(function(err, cityInfo){
          console.log("获得当前城市信息" + JSON.stringify(cityInfo));
          if (err) {
            return cb(err);
          }
          return cb(null);
        });
      });
    });
  },
  encodeSn: function(sn){
    var rpAry, rpAry1, i$, len$, i, v;
    rpAry = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
    rpAry1 = ["⑴", "⑵", "⑶", "⑷", "⑸", "⑹", "⑺", "⑻", "⑼", "⑽"];
    for (i$ = 0, len$ = rpAry.length; i$ < len$; ++i$) {
      i = i$;
      v = rpAry[i$];
      sn = sn.replace(v, i + 1);
      sn = sn.replace(rpAry1[i], i + 1);
    }
    return sn;
  },
  getCache: function(cacheName, cb){
    var cache;
    if ((cache = Settings.option(cacheName)) != null) {
      console.log("从缓存取出" + cacheName);
      cb(null, cache);
      return cache;
    } else {
      return null;
    }
  },
  setCache: function(cacheName, val, cb){
    var cacheVal;
    cacheVal = Settings.option(cacheName);
    if (!_.isEqual(val, cacheVal)) {
      console.log(cacheName + "发生改变,重试更新!!");
      Settings.option(cacheName, val);
      return cb(null, val);
    }
  },
  getNearLines: function(cb){
    var this$ = this;
    this.getCache('nearLines', cb);
    return this.request({
      path: "/bus/stop!nearlines.action",
      params: {
        "gpstype": 'wgs'
      }
    }, function(err, data){
      var nearLines, res$, i$, ref$, len$, i, v;
      if (err) {
        return cb(err);
      }
      res$ = [];
      for (i$ = 0, len$ = (ref$ = data.nearLines).length; i$ < len$; ++i$) {
        i = i$;
        v = ref$[i$];
        res$.push({
          distance: v.distance,
          stationId: v.sId,
          sn: this$.encodeSn(v.sn),
          modelVersion: v.sortPolicy.replace("modelVersion=", "")
        });
      }
      nearLines = res$;
      return this$.setCache('nearLines', nearLines, cb);
    });
  },
  getStationDetail: function(arg$, cb){
    var modelVersion, stationId, this$ = this;
    modelVersion = arg$.modelVersion, stationId = arg$.stationId;
    this.getCache("station_" + stationId, cb);
    return this.request({
      path: "/bus/stop!stationDetail.action",
      params: {
        "stats_referer": "nearby",
        "stats_order": "1-2",
        "modelVersion": modelVersion,
        "stats_act": "refresh",
        "stationId": stationId
      }
    }, function(err, data){
      var lines, res$, i$, ref$, len$, i, v, stationDetail;
      if (err) {
        return cb(err);
      }
      res$ = [];
      for (i$ = 0, len$ = (ref$ = data.lines).length; i$ < len$; ++i$) {
        i = i$;
        v = ref$[i$];
        res$.push({
          "lineId": v.line.lineId,
          "name": v.line.name,
          "state": v.line.state,
          "desc": v.line.desc,
          "firstTime": v.line.firstTime,
          "lastTime": v.line.lastTime,
          "startSn": this$.encodeSn(v.line.startSn),
          "endSn": this$.encodeSn(v.line.endSn),
          "nextStation": this$.encodeSn(v.nextStation.sn),
          "targetOrder": v.targetStation.order
        });
      }
      lines = res$;
      stationDetail = {
        sn: this$.encodeSn(data.sn),
        lines: lines
      };
      return this$.setCache("station_" + stationId, stationDetail, cb);
    });
  },
  getLineDetail: function(arg$, cb){
    var lineId, targetOrder, this$ = this;
    lineId = arg$.lineId, targetOrder = arg$.targetOrder;
    this.getCache("lineDetail_" + lineId, cb);
    return this.request({
      path: "/bus/line!lineDetail.action",
      params: {
        "stats_referer": "stationDetail",
        "stats_act": "enter",
        "stats_order": "1-1",
        "lineId": lineId,
        "targetOrder": targetOrder
      }
    }, function(err, data){
      var stationName, i$, ref$, len$, i, v, lastTravelTime, buses, res$, rv, ref1$, arrivalTime, travelTime, lineDetail;
      if (err) {
        return cb(err);
      }
      stationName = "";
      if ((data != null ? data.stations : void 8) != null) {
        for (i$ = 0, len$ = (ref$ = data.stations).length; i$ < len$; ++i$) {
          i = i$;
          v = ref$[i$];
          if (v.order === data.targetOrder) {
            stationName = v.sn;
          }
        }
        lastTravelTime = -1;
        res$ = [];
        for (i$ = 0, len$ = (ref$ = data.buses).length; i$ < len$; ++i$) {
          i = i$;
          v = ref$[i$];
          rv = {
            state: v.state
          };
          if (v.state > -1 && v.travels.length > 0) {
            ref1$ = v.travels[0], arrivalTime = ref1$.arrivalTime, travelTime = ref1$.travelTime;
            if (lastTravelTime === -1 || travelTime < lastTravelTime) {
              lastTravelTime = travelTime;
            }
            rv.arrivalTime = arrivalTime;
            rv.travelTime = travelTime;
          }
          res$.push(rv);
        }
        buses = res$;
        lineDetail = {
          name: data.line.name,
          price: data.line.price,
          depDesc: data.depDesc,
          desc: data.line.desc,
          firstTime: data.line.firstTime,
          lastTime: data.line.lastTime,
          startSn: this$.encodeSn(data.line.startSn),
          endSn: this$.encodeSn(data.line.endSn),
          flpolicy: data.line.sortPolicy.replace("flpolicy=", ""),
          lastTravelTime: lastTravelTime,
          buses: buses
        };
        return this$.setCache("lineDetail_" + lineId, lineDetail, cb);
      }
    });
  },
  updateBusesDetail: function(arg$, cb){
    var lineId, targetOrder, flpolicy, this$ = this;
    lineId = arg$.lineId, targetOrder = arg$.targetOrder, flpolicy = arg$.flpolicy;
    return this.request({
      path: "/bus/line!busesDetail.action",
      params: {
        "stats_referer": "stationDetail",
        "stats_act": "refresh",
        "stats_order": "1-5",
        "flpolicy": flpolicy,
        "lineId": lineId,
        "targetOrder": targetOrder,
        "filter": 1
      }
    }, function(err, data){
      var lastTravelTime, buses, res$, i$, ref$, len$, i, v, rv, ref1$, arrivalTime, travelTime;
      if (err) {
        return cb(err);
      }
      lastTravelTime = -1;
      if ((data != null ? data.buses : void 8) != null) {
        res$ = [];
        for (i$ = 0, len$ = (ref$ = data.buses).length; i$ < len$; ++i$) {
          i = i$;
          v = ref$[i$];
          rv = {
            state: v.state
          };
          if (v.state > -1 && v.travels.length > 0) {
            ref1$ = v.travels[0], arrivalTime = ref1$.arrivalTime, travelTime = ref1$.travelTime;
            if (lastTravelTime === -1 || travelTime < lastTravelTime) {
              lastTravelTime = travelTime;
            }
            rv.arrivalTime = arrivalTime;
            rv.travelTime = travelTime;
          }
          res$.push(rv);
        }
        buses = res$;
        return cb(null, {
          depDesc: data.depDesc,
          desc: data.line.desc,
          lastTravelTime: lastTravelTime,
          buses: buses
        });
      }
    });
  },
  collectionList: function(){
    var collectionList;
    collectionList = Settings.option('collectionList') || [];
    Settings.option('collectionList', collectionList);
    return collectionList;
  },
  joinCollection: function(arg$){
    var lineId, sn, targetOrder, startSn, endSn, collectionList, i$, len$, i, v;
    lineId = arg$.lineId, sn = arg$.sn, targetOrder = arg$.targetOrder, startSn = arg$.startSn, endSn = arg$.endSn;
    collectionList = this.collectionList();
    for (i$ = 0, len$ = collectionList.length; i$ < len$; ++i$) {
      i = i$;
      v = collectionList[i$];
      if (lineId === v.lineId) {
        return;
      }
    }
    collectionList.push({
      lineId: lineId,
      targetOrder: targetOrder,
      startSn: startSn,
      endSn: endSn,
      sn: sn
    });
    return Settings.option('collectionList', collectionList);
  },
  hasCollection: function(lineId){
    var collectionList, i$, len$, i, v;
    collectionList = this.collectionList();
    for (i$ = 0, len$ = collectionList.length; i$ < len$; ++i$) {
      i = i$;
      v = collectionList[i$];
      if (lineId === v.lineId) {
        return true;
      }
    }
  },
  removeCollection: function(lineId){
    var collectionList, newCollectionList, i$, len$, i, v;
    collectionList = this.collectionList();
    newCollectionList = [];
    for (i$ = 0, len$ = collectionList.length; i$ < len$; ++i$) {
      i = i$;
      v = collectionList[i$];
      if (lineId !== v.lineId) {
        newCollectionList.push(v);
      }
    }
    return Settings.option('collectionList', newCollectionList);
  }
};
module.exports = Bus;
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}