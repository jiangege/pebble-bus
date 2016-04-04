require! {
  "./components/crypto-js": CryptoJS
  "lodash": _
  "ajax"
  "settings": Settings
  "imei": imei_gen
  "udid": udid_gen
}



Bus =
  url: "http://api.chelaile.net.cn:7000"
  udid: null
  key: "woqunimalegebi1234567890"
  request: ({
    method = "get",
    path = "",
    params,
  }, cb = ->) ->
    opts = {
      url: @url + path
      method
      type: \text
      cache: false
    }

    if method is "get"
      opts.url += @preFillParams params
    else
      opts.data = @preFillParams params, false

    console.log "Request #{method} #{opts.url}"

    ajax opts
    , (data) ~>
      try
        data = @handerRes data
        if data.errmsg?
          cb new Error data.errmsg
        else if data?.jsonr?.data?
          cb null, data.jsonr.data
        else
          cb new Error "无法解析数据"
      catch error
        cb error

    , (error) ->
      cb new Error "网络错误:#{error}"

  handerRes: (data) -> JSON.parse (data.replace /\*|#|(YGKJ)/gmi, "")

  preFillParams: (params, isQuery = true) ->
    initParams = {
      last_src: "app_baidu_as"
      s: "android"
      sign: @cryptoSign!
      push_open: 0
      userId: @userId!
      geo_type: "gcj"
      wifi_open: 1
      lchsrc: "icon"
      nw: "WIFI"
      vc: "50"
      sv: "5.1"
      v: "3.11.0"
      imei: @IMEI!
      udid: @UDID!
      clientId: @UDID!
      first_src: "app_baidu_as"
    }

    initParams <<< @coords!
    initParams <<< @cityInfo!
    initParams <<< params
    if isQuery
      paramsStr = "?"
      for let k, v of initParams
        if paramsStr.length > 1
          paramsStr += "&"
        paramsStr += "#{k}=#{v}"
      paramsStr
    else
      initParams

  UDID: ->
    Settings.option "udid", udid = (Settings.option("udid") or udid_gen!)
    udid

  IMEI: ->
    Settings.option "imei", imei = (Settings.option("imei") or imei_gen!)
    imei

  cryptoSign: (key) ->
    keyHex = CryptoJS.enc.Utf8.parse (key or @key)
    encrypted = CryptoJS.TripleDES.encrypt "" + Date.now(), keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
    encrypted.toString!

  userId: -> Settings.option("userId") or "unknown"

  coords: -> Settings.option("coords") or {}

  cityInfo: ->
    if (cityInfo = Settings.option("cityInfo"))?
      {
        gen_lat: cityInfo.lat
        gen_lng: cityInfo.lng
        cityId: cityInfo.cityId
      }
    else {}

  getCurrentLocation: (cb) ->
    navigator.geolocation.getCurrentPosition (pos) ->
      if (lat = pos?.coords?.latitude)? and (lng = pos?.coords?.longitude)?
        coords = {
          lat
          lng
        }
        Settings.option "coords", coords
        cb null, coords
      else
        cb new Error "无法获取位置,请检查gps开关"
    , -> cb new Error "无法获取位置,请检查gps开关"
    , {
      maximumAge: 10000
      timeout: 10000
    }

  getUserID: (cb) ->
    unless (useId = Settings.option("userId"))?
      @request {
        path: "/wow/user!create.action"
      }, (err, data) ->
        return cb err if err
        if (userid = data.userinfo?.userId)?
          Settings.option "userId", userid
          cb null, userid
        else
          cb new Error "无法获取user Id"
    else cb null, useId

  getCurrentCity: (cb) ->
    @request {
      path: "/goocity/city!localCity.action"
    }, (err, data) ->
      return cb err if err
      if (localCity = data.localCity)?.cityId isnt ""
        cityInfo = {
          cityId: localCity.cityId
          cityName: localCity.cityName
          lat: localCity.lat
          lng: localCity.lng
        }
        Settings.option "cityInfo", cityInfo
        cb null, cityInfo
      else
        cb new Error "暂不支持该城市"

  auth: (cb) ->
    (err, userId) <~ @getUserID
    console.log "获得用户id#{userId}"
    return cb err if err
    (err, coords) <~ @getCurrentLocation
    console.log "获得当前坐标#{JSON.stringify coords}"
    return cb err if err
    (err, cityInfo) <~ @getCurrentCity
    console.log "获得当前城市信息#{JSON.stringify cityInfo}"
    return cb err if err
    cb null

  encodeSn: (sn) ->
    rpAry = ["①" "②" "③" "④" "⑤" "⑥" "⑦" "⑧" "⑨" "⑩"]
    rpAry1 = ["⑴" "⑵" "⑶" "⑷" "⑸" "⑹" "⑺" "⑻" "⑼" "⑽"]
    for v, i in rpAry
      sn = sn.replace v, i + 1
      sn = sn.replace rpAry1[i], i + 1
    sn

  getNearLines: (cb) ->
    if (nearLinesCache = Settings.option \nearLines)?
      console.log "从缓存获取附近站点信息"
      cb null, nearLinesCache
    @request {
      path: "/bus/stop!nearlines.action"
      params:
        "gpstype": \wgs
    }, (err, data) ~>
      return cb err if err
      nearLines = for v, i in data.nearLines
        {
          distance: v.distance
          stationId: v.sId
          sn: @encodeSn v.sn
          modelVersion: v.sortPolicy.replace "modelVersion=", ""
        }
      unless _.isEqual nearLines, nearLinesCache
        console.log "附近站点信息发生变化,重试更新"
        Settings.option \nearLines, nearLinesCache
        cb null, nearLines

  getStationDetail: ( {modelVersion, stationId}, cb) ->
    if (stationDetailCache = Settings.option "station_#{stationId}")?
      console.log "从缓存获取线路信息"
      cb null, stationDetailCache

    @request {
      path: "/bus/stop!stationDetail.action"
      params:
        "stats_referer": "nearby"
        "stats_order": "1-2"
        "modelVersion": modelVersion
        "stats_act": "refresh"
        "stationId": stationId
    }, (err, data) ~>
      return cb err if err
      lines = for v, i in data.lines
        {
          "lineId": v.line.lineId
          "name": v.line.name
          "state": v.line.state
          "desc": v.line.desc
          "firstTime": v.line.firstTime
          "lastTime": v.line.lastTime
          "startSn": @encodeSn v.line.startSn
          "endSn": @encodeSn v.line.endSn
          "nextStation": @encodeSn v.nextStation.sn
          "targetOrder": v.targetStation.order
        }

      stationDetail = {
        sn: @encodeSn data.sn
        lines
      }
      unless _.isEqual stationDetail, stationDetailCache
        console.log "线路信息发生变化,重新更新"
        Settings.option "station_#{stationId}", stationDetail
        cb null, stationDetail

  getLineDetail: ( {lineId, targetOrder}, cb) ->
    if (lineDetailCache = Settings.option "lineDetail_#{lineId}")?
      console.log "从缓存获取公交信息"
      cb null, lineDetailCache
    @request {
      path: "/bus/line!lineDetail.action"
      params:
        "stats_referer": "stationDetail"
        "stats_act": "enter"
        "stats_order": "1-1"
        "lineId": lineId
        "targetOrder": targetOrder
    }, (err, data) ~>
      return cb err if err
      stationName = ""
      for v, i in data.stations
        if v.order is data.targetOrder
          stationName = v.sn

      lastTravelTime = -1

      buses = for v, i in data.buses
        rv = {
          state: v.state
        }
        if v.state > -1 and v.travels.length > 0
          {arrivalTime, travelTime} = v.travels[0]
          if lastTravelTime is -1 or travelTime < lastTravelTime
            lastTravelTime = travelTime
          rv <<< {
            arrivalTime
            travelTime
          }
        rv

      lineDetail = {
        name: data.line.name
        price: data.line.price
        depDesc: data.depDesc
        desc: data.line.desc
        firstTime: data.line.firstTime
        lastTime: data.line.lastTime
        startSn: @encodeSn data.line.startSn
        endSn: @encodeSn data.line.endSn
        flpolicy: data.line.sortPolicy.replace "flpolicy=", ""
        lastTravelTime
        buses
      }
      unless _.isEqual lineDetail, lineDetailCache
        console.log "公交信息发生变化，重试更新"
        Settings.option "lineDetail_#{lineId}", lineDetail
        cb null, lineDetail


  updateBusesDetail: ( {lineId, targetOrder, flpolicy}, cb) ->
    @request {
      path: "/bus/line!busesDetail.action"
      params:
        "stats_referer": "stationDetail"
        "stats_act": "refresh"
        "stats_order": "1-5"
        "flpolicy": flpolicy
        "lineId": lineId
        "targetOrder": targetOrder
        "filter": 1
    }, (err, data) ~>
      return cb err if err

      lastTravelTime = -1
      buses = for v, i in data.buses
        rv = {
          state: v.state
        }
        if v.state > -1 and v.travels.length > 0
          {arrivalTime, travelTime} = v.travels[0]
          if lastTravelTime is -1 or travelTime < lastTravelTime
            lastTravelTime = travelTime
          rv <<< {
            arrivalTime
            travelTime
          }
        rv
      cb null, {
        depDesc: data.depDesc
        desc: data.line.desc
        lastTravelTime
        buses
      }

  collectionList: ->
    collectionList = Settings.option \collectionList or []
    Settings.option \collectionList, collectionList
    collectionList

  joinCollection: ({lineId, sn, targetOrder, startSn, endSn}) ->
    collectionList = @collectionList!
    for v, i in collectionList then if lineId is v.lineId then return
    collectionList.push {
      lineId
      targetOrder
      startSn
      endSn
      sn
    }
    Settings.option \collectionList, collectionList

  hasCollection: (lineId) ->
    collectionList = @collectionList!
    for v, i in collectionList then if lineId is v.lineId then return true

  removeCollection: (lineId) ->
    collectionList = @collectionList!
    newCollectionList = []
    for v, i in collectionList then if lineId isnt v.lineId then newCollectionList.push v
    Settings.option \collectionList, newCollectionList



module.exports = Bus
