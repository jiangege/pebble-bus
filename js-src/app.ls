require! {
  ui: {
    Window
    Rect
    Text
    Image
  }
  vector2: Vector2
}


win = new Window fullscreen: true


bgEle = new Rect {
  position: new Vector2 0, 0
  size: new Vector2 144, 168
  backgroundColor: "darkGray"
}

win.add bgEle
win.show!

console.log \run
