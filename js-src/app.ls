require! {
  "bus": Bus
  "ui": UI
  "settings": Settings
}

class GenWin
  updateInv: 1000 * 15
  _updateInv: null

  show: (@params = {}) -> @win.show!

  hide: -> @win.hide!

  loaderrorCallback: ->

  onloaderror: (cb) -> @loaderrorCallback = cb

  runUpdateTimer: ->
    @stopUpdateTimer!
    @_updateInv = setInterval ~>
      @load (~> @update!), false
    , @updateInv

  stopUpdateTimer: ->
    clearInterval @_updateInv

class NearLinesWin extends GenWin
  ->
    @win = new UI.Menu {
      backgroundColor: \white
      textColor: \black
      highlightBackgroundColor: \black
      highlightTextColor: \white
    }

    @win.on \select, (e) ~>
      if @data? then @selectCallback @data[e.sectionIndex]

    @win.on \show, (e) ~>
      @load ~> @update!


  load: (cb) ->
    (err, lines) <~ Bus.getNearLines
    return @loaderrorCallback err if err

    collectionList = for v, i in Bus.collectionList!
      v.type = "collection"
      v

    @data = collectionList ++ lines
    cb!

  update: ->
    for line, i in @data
      title = ""
      sn = line.sn
      if line.type is "collection"
        title = "我的收藏"
        sn += "路"
      else
        title = "distance / #{line.distance}m"

      if @win.section(i)?.items[0]?.title isnt sn
        @win.section i, {
          title
          items:
            * title: sn
            ...
        }

  selectCallback: ->
  onselect: (cb) -> @selectCallback = cb


class StationDetailWin extends GenWin
  ->
    @win = new UI.Menu {
      backgroundColor: 'white'
      textColor: 'black'
      highlightBackgroundColor: 'black'
      highlightTextColor: 'white'
    }

    @win.on \select, (e) ~>
      if @data?.lines[e.sectionIndex - 1]? then @selectCallback @data.lines[e.sectionIndex - 1]

    @win.on \show, (e) ~>
      @load ~> @update!

  load: (cb) ->
    (err, detail) <~ Bus.getStationDetail @params.line
    return @loaderrorCallback err if err
    @data = detail
    cb!

  update: ->

    for line, i in @data.lines
      if i is 0
        @win.section i, title: @data.sn, items: []
      else
        desc = if line.desc then "(#{line.desc})" else ""
        if @win.section(i)?.items[0]?.title isnt "#{line.name} #{desc}"
          @win.section i, {
            title: "#{line.firstTime} - #{line.lastTime}"
            items:
              * title: "#{line.name}路 #{desc}"
                subtitle: "#{line.startSn} -> #{line.endSn}"
              ...
          }

  selectCallback: ->

  onselect: (cb) -> @selectCallback = cb

class BusesDetailWin extends GenWin
  ->
    @win = new UI.Card {
      scrollable: true
    }
    @win.on \show, (e) ~>
      @load ~> @update!
      @runUpdateTimer!

    @win.on \hide, (e) ~>
      @stopUpdateTimer!

    @win.on \click, \select, (e) ~>
      return unless @data?
      @data.hasCollection = !@data.hasCollection
      if @data.hasCollection
        Bus.joinCollection @params.line <<< sn: @data.name
      else
        Bus.removeCollection @params.line.lineId

      @updateCollection!

  load: (cb, formShow = true) ->
    if formShow
      (err, detail) <~ Bus.getLineDetail @params.line
      return @loaderrorCallback err if err
      @data = detail <<< hasCollection: !!Bus.hasCollection @params.line.lineId
      cb!
    else if @data
      (err, detail) <~ Bus.updateBusesDetail {} <<< @params.line <<< {flpolicy: @data.flpolicy}
      return @loaderrorCallback err if err
      @data <<< detail
      cb!

  update: ->

    @win.title "#{@data.name}路 需要#{@data.price}"

    @updateCollection!

    subtitleStr = ""

    if @data.desc? and @data.desc.trim! isnt ""
      subtitleStr = @data.depDesc or @data.desc
    else if @data.lastTravelTime isnt -1
      if @data.lastTravelTime < 60
        subtitleStr = "#{@data.lastTravelTime}秒"
      else
        lastTravelTime = Math.round @data.lastTravelTime / 60
        subtitleStr = "#{lastTravelTime}分钟"

    @win.subtitle subtitleStr

    @win.body """
      #{@data.firstTime} - #{@data.lastTime}
      #{@data.startSn} -> #{@data.endSn}
    """

  updateCollection: ->
    title = @win.title!
    @win.title title.replace("(已收藏)", "") + if @data.hasCollection then "(已收藏)" else ""


class AlertWin extends GenWin
  ->
    @win = new UI.Card {
      scrollable: true
    }
    @win.on \show, (e) ~>
      @update!

  update: ->
    type = @params.type
    if type is 0
      @win.title "提示"
    else if type is 1
      @win.title "警告"
    else if type is 3
      @win.title "错误!!"

    @win.body @params.info


class SplashScreenWin extends GenWin
  ->
    @win = new UI.Card {
      scrollable: true
      title: "加载中..."
    }

    @win.on \show, ~>
      @load!

  load: ->
    (err) <~ Bus.auth
    return @loaderrorCallback err if err
    @loadsuccessCallback!

  loadsuccessCallback: ->
  onloadsuccess: (cb) -> @loadsuccessCallback = cb


BusUI =
  wins:
    nearLinesWin: new NearLinesWin
    stationDetailWin: new StationDetailWin
    busesDetailWin: new BusesDetailWin
    alertWin: new AlertWin
    splashScreenWin: new SplashScreenWin
  init: ->
    for let i, win of @wins
      win.onloaderror (error) ~>
        win.hide!
        @wins.alertWin.show {
          type: 3
          info: error.message
        }

    @wins.splashScreenWin.onloadsuccess ~>
      @wins.nearLinesWin.show!
      @wins.splashScreenWin.hide!
      (line) <~ @wins.nearLinesWin.onselect
      if line.type is \collection
        @wins.busesDetailWin.show line: line
      else
        @wins.stationDetailWin.show line: line
      (line) <~ @wins.stationDetailWin.onselect
      @wins.busesDetailWin.show line: line

    @wins.splashScreenWin.show!


BusUI.init!
