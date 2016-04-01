require! {
  "bus": Bus
  "ui": UI
  "settings": Settings
}

class Component
  updateInv: 1000 * 10
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

class NearLinesWin extends Component
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


  load: (cb)->
    (err, lines) <~ Bus.getNearLines
    return @loaderrorCallback err if err
    @data = lines
    cb!

  update: ->
    sections = for line, i in @data
      {
        title: "distance / #{line.distance}m"
        items:
          * title: line.sn
          ...
      }
    @win.sections sections

  selectCallback: ->
  onselect: (cb) -> @selectCallback = cb


class StationDetailWin extends Component
  ->
    @win = new UI.Menu {
      backgroundColor: 'white'
      textColor: 'black'
      highlightBackgroundColor: 'black'
      highlightTextColor: 'white'
    }

    @win.on \select, (e) ~>
      if @data? then @selectCallback @data.lines[e.sectionIndex - 1]

    @win.on \show, (e) ~>
      @load ~> @update!

  load: (cb) ->
    (err, detail) <~ Bus.getStationDetail @params.line
    return @loaderrorCallback err if err
    @data = detail
    cb!

  update: ->
    sections = [{title: @data.sn, items: []}]
    for line, i in @data.lines
      desc = if line.desc then "(#{line.desc})" else ""
      sections.push {
        title: "#{line.firstTime} - #{line.lastTime}"
        items:
          * title: "#{line.name} #{desc}"
            subtitle: "#{line.startSn} -> #{line.endSn}"
          ...
      }

    @win.sections sections


  selectCallback: ->

  onselect: (cb) -> @selectCallback = cb

class BusesDetailWin extends Component
  ->
    @win = new UI.Card {
      scrollable: true
    }
    @win.on \show, (e) ~>
      @load ~> @update!
      @runUpdateTimer!

    @win.on \hide, (e) ~>
      @stopUpdateTimer!

  load: (cb, formShow = true) ->
    if formShow
      (err, detail) <~ Bus.getLineDetail @params.line
      return @loaderrorCallback err if err
      @data = detail
      cb!
    else if @data
      (err, detail) <~ Bus.updateBusesDetail {} <<< @params.line <<< {flpolicy: @data.flpolicy}
      return @loaderrorCallback err if err
      @data <<< detail
      cb!



  update: ->
    @win.title "#{@data.name} 需要#{@data.price}"

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


class AlertWin extends Component
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



BusUI =
  wins:
    nearLinesWin: new NearLinesWin
    stationDetailWin: new StationDetailWin
    busesDetailWin: new BusesDetailWin
    alertWin: new AlertWin
  init: ->
    for let i, win of @wins
      win.onloaderror (error) ~>
        win.hide!
        @wins.alertWin.show {
          type: 3
          info: error.message
        }

    @wins.nearLinesWin.show!
    (line) <~ @wins.nearLinesWin.onselect
    @wins.stationDetailWin.show line: line
    (line) <~ @wins.stationDetailWin.onselect
    @wins.busesDetailWin.show line: line


BusUI.init!
