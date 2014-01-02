var KEYCODE={'Backspace':8,'Tab':9,'Enter':13,'Shift':16,'Ctrl':17,'Alt':18,'Pause':19,'CapsLock':20,'Esc':27,'Space':32,'PageUp':33,'PageDown':34,'End':35,'Home':36,'Left':37,'Up':38,'Right':39,'Down':40,'Insert':45,'Delete':46,'0':48,'1':49,'2':50,'3':51,'4':52,'5':53,'6':54,'7':55,'8':56,'9':57,'a':65,'b':66,'c':67,'d':68,'e':69,'f':70,'g':71,'h':72,'i':73,'j':74,'k':75,'l':76,'m':77,'n':78,'o':79,'p':80,'q':81,'r':82,'s':83,'t':84,'u':85,'v':86,'w':87,'x':88,'y':89,'z':90,'Windows':91,'RightClick':93,'Numpad 0':96,'Numpad 1':97,'Numpad 2':98,'Numpad 3':99,'Numpad 4':100,'Numpad 5':101,'Numpad 6':102,'Numpad 7':103,'Numpad 8':104,'Numpad 9':105,'Numpad *':106,'Numpad +':107,'Numpad -':109,'Numpad .':110,'Numpad /':111,'F1':112,'F2':113,'F3':114,'F4':115,'F5':116,'F6':117,'F7':118,'F8':119,'F9':120,'F10':121,'F11':122,'F12':123,'NumLock':144,'ScrollLock':145,'MyComputer':182,'MyCalculator':183,';':186,'=':187,',':188,'-':189,'.':190,'/':191,'`':192,'[':219,'\\':220,']':221,'\'':222}
var pd = function() { console.log.apply(console, arguments) }

// Display array in "a b c"
rivets.formatters.array = {
  read: function(ary) {
    return ary.join(" ")
  },
  publish: function(text) {
    return text.trim().split(/ +/)
  }
}

var A = {
  a: [ ],
  entries: [],     // all entries
  edit_entry: {tags: []},  // current edit entry, from entries
  i: 0,           // current edit entry index
}
rivets.bind($("body"), {A: A})

var port = self.port

$("#search")
  .on("input", function(e) {
    port.emit("search", this.value)
  })
  .on("keydown", function(e) {
    if (e.ctrlKey && e.which == KEYCODE["u"]) {
      $(this).val("").trigger("input")
      return false
    }
  })

$("#result").on("click", "li", function(e) {
  port.emit("click-entry", $(this).data("url"))
})

/*
 * ¤data
 */

port.on("update-result", function(entries) {
  // rivets BUG: A.entries = entries not work
  //             after port, can't use hash directlly.
  A.entries = $.extend(true, [], entries)
})

port.on("update-icon", function(entry) {
  A.entries[entry["idx"]]["icon"] = entry["icon"]
})

/*
 * ¤menu
 */

$("#result").on("contextmenu", "li", function(e) {
  A.i = $(this).index()
  A.edit_entry = A.entries[A.i]
})

$("#menu-edit").on("click", function(e) {
  $("#dlgedit").modal("show")
})

$("#menu-delete").on("click", function(e) {
  port.emit("delete-entry", A.i)
  A.entries.splice(A.i, 1)
})

/*
 * ¤dialog: Edit Bookmark
 */
$("#dlgedit").on("shown.bs.modal", function(e) {
  $("#input-title").focus()
})

$("#dlgedit-save").on("click", function(e) {
  port.emit("save-entry", A.i, A.edit_entry)
  $("#dlgedit").modal("hide")
})

$("#dlgedit-form").on("keydown", "input", function(e) {
  if (e.which == KEYCODE["Enter"])  {
    $(this).trigger("blur")
    $("#dlgedit-save").trigger("click")
  }
})

$(document).ready(function(e) {
  $("#search").focus()
})

// ¤test
//$("#search").val("a").trigger("input")
