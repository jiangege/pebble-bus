require! {
  "./pre-processor": PP
  "vector2": Vector2
  "ui": UI
}


/*
Lifeline =
  start: ->
    console.log "生命线游戏开始加载"

  loadStore: (storeStep) ->
    storeObj = PP.parse storeStep

    console.log JSON.stringify storeObj
*/


const NT_FULLSIZE = new Vector2 144, 168 - 16

class LifelineWin
  ({
    @dataList = []
    @comList = []
    @oneScreeSize = NT_FULLSIZE
    @scrollY = 0
    @movieYSpacing = NT_FULLSIZE.y
    @realHeight = 0
  } = {}) ->
    @wind = new UI.Window
    @wind.on \click, \down, ~> @scrollBottom!
    @wind.on \longClick, \down, ~> @scrollBottom!
    @wind.on \click, \up, ~> @scrollUp!
    @wind.on \longClick, \up, ~> @scrollUp!


  show: -> @wind.show!


  update: ->
    @calc!
    @calcPosition!
    for com, i in @comList then com.update!

  scrollBottom: ->
    @calcRealHeight!
    return unless @realHeight < NT_FULLSIZE.y
    if (@scrollY -= @movieYSpacing) < NT_FULLSIZE.y - @realHeight
      @scrollY = NT_FULLSIZE.y - @realHeight
    @update!
  scrollUp: ->
    if (@scrollY += @movieYSpacing) > 0
      @scrollY = 0
    @update!

  calcRealHeight: ->
    @realHeight = 0
    for com, i in @comList then @realHeight += com.size.y

  calc: ->
    @calcRealHeight!
    for com, i in @comList
      beforeY = ( @comList[ i - 1]?.pos?.y ) ? 0
      beforeHeight = ( @comList[ i - 1]?.size?.y ) ? 0
      com.position new Vector2 0, beforeY + beforeHeight

  calcPosition: ->
    for com, i in @comList
      com.position new Vector2 0, com.pos.y + @scrollY


  add: (data) ->
    data = ^^data
    data <<< {
      size: @oneScreeSize
      pos: new Vector2 0, 0
    }
    @comList.push switch data.type
    | "msg" => new LifelineMsg data
    @comList = @comList.slice -3
    @updateCom!
    @dataList.push data
    @update!


  updateCom: ->
    @wind.each (e) ~> @wind.remove e
    @comList.forEach (com) ~> com.comList.forEach (com) ~> @wind.add com



class LifelineCom
  ({size, pos, id}) ->
    @size = size
    @pos = pos
    @id = id
    @comList = []

  position: (v) -> @pos = v




class LifelineMsg extends LifelineCom
  (data) ->
    super data
    @rect = new UI.Rect {
      size: @size,
      backgroundColor: 'yellow'
      borderColor: "green"
    }

    @comList.push @rect

  update: ->
    @rect.animate {position: new Vector2 0, @pos.y}, 100





lifelineWin = new LifelineWin


lifelineWin.add id:"test", type: "msg", msg: "hello"
lifelineWin.add id:"test1", type: "msg", msg: "hello"
lifelineWin.add id:"test1", type: "msg", msg: "hello"

lifelineWin.show!
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
