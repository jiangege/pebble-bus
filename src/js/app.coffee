UI = require "ui"

menu = new UI.Menu
  backgroundColor: 'black'
  textColor: 'white'
  highlightBackgroundColor: 'white'
  highlightTextColor: 'red'
  sections: [{
    title: 'First section'
    items: [{
      title: 'First Item'
      subtitle: 'Some subtitle'
      icon: 'images/item_icon.png'
    }, {
      title: 'Second item'
    }]
  }]

menu1 = new UI.Menu
  backgroundColor: 'black'
  textColor: 'white'
  highlightBackgroundColor: 'white'
  highlightTextColor: 'red'
  sections: [{
    title: 'two section'
    items: [{
      title: 'First Item'
      subtitle: 'Some subtitle'
      icon: 'images/item_icon.png'
    }, {
      title: 'Second item'
    }]
  }]


menu.on "select", (e)->
  menu1.show()

menu.show()
