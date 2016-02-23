require! {
  "./pre-processor": PP
  "vector2": Vector2
}

toAry = (obj) ->
  for key, val of obj
    "key": key
    "val": val

Lifeline =
  start: ->
    console.log "生命线游戏开始加载"

  loadStore: (storeStep) ->
    storeObj = PP.parse storeStep

    console.log JSON.stringify storeObj





/*
class StoreContiner
  show: ->
  update: ->
  add: ->
*/

class LifelineWin
  ({
    @dataList = []
    @comList = []
    @currIndex = -1
    @comCurrIndex = -1
    @oneScreeSize = new Vector2 144, 20
    @scrollY = 0
    @movieYSpacing = 20
    @realHeight = 0
  } = {}) ->
    @win = new UI.window!

    @win.on \click, \down, ~> @scrollBottom!
    @win.on \click, \up, ~> @scrollUp!


  show: -> @win.show
  render: ->
    @calc!

  scrollBottom: ->
    @calcRealHeigh!
    if Math.abs( @scrollY -= @movieSpacing ) > @realHeight - @oneScreeSize.y
      @scrollY = -(@realHeight - @oneScreeSize.y)
    @render!
  scrollUp: ->
    if @scrollY += @movieSpacing > 0
      @scrollY = 0

    @render!

  calcRealHeight: ->
    for com, i in @comList then @realHeight += com.size.y
  calc: ->
    @calcRealHeight!
    for com, i in @comList
      beforeY = ( @comList[ i - 1]?.pos?.y ) ? 0
      beforeHeight = ( @comList[ i - 1]?.size?.y ) ? 0
      com.pos.y = beforeY + beforeHeight + @scrollY

  add: (data) ->
    data = ^^data
    data <<< {
      size: @oneScreeSize
    }
    @comList.push switch data.type
    | "msg" => new LifelineMsg data
    @comList = @comList.slice -3
    @currIndex ++
    @dataList.push data
    @render!



class LifelineCom
  ({size, pos}) ->
    @size = new Vector2 size
    @pos = new Vector2 pos


class LifelineMsg extends LifelineCom
  (data) ->
    super data

  render: ->





lifelineWin = new LifelineWin


lifelineWin.add new LifelineMsg msg: "hello"


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
