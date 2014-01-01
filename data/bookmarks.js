var KEYCODE={'Backspace':8,'Tab':9,'Enter':13,'Shift':16,'Ctrl':17,'Alt':18,'Pause':19,'CapsLock':20,'Esc':27,'Space':32,'PageUp':33,'PageDown':34,'End':35,'Home':36,'Left':37,'Up':38,'Right':39,'Down':40,'Insert':45,'Delete':46,'0':48,'1':49,'2':50,'3':51,'4':52,'5':53,'6':54,'7':55,'8':56,'9':57,'a':65,'b':66,'c':67,'d':68,'e':69,'f':70,'g':71,'h':72,'i':73,'j':74,'k':75,'l':76,'m':77,'n':78,'o':79,'p':80,'q':81,'r':82,'s':83,'t':84,'u':85,'v':86,'w':87,'x':88,'y':89,'z':90,'Windows':91,'RightClick':93,'Numpad 0':96,'Numpad 1':97,'Numpad 2':98,'Numpad 3':99,'Numpad 4':100,'Numpad 5':101,'Numpad 6':102,'Numpad 7':103,'Numpad 8':104,'Numpad 9':105,'Numpad *':106,'Numpad +':107,'Numpad -':109,'Numpad .':110,'Numpad /':111,'F1':112,'F2':113,'F3':114,'F4':115,'F5':116,'F6':117,'F7':118,'F8':119,'F9':120,'F10':121,'F11':122,'F12':123,'NumLock':144,'ScrollLock':145,'MyComputer':182,'MyCalculator':183,';':186,'=':187,',':188,'-':189,'.':190,'/':191,'`':192,'[':219,'\\':220,']':221,'\'':222}
var pd = function() { console.log.apply(console, arguments) }

var port = self.port
var result_template =  _.template(
  '<% _.each(rows, function(row, i) { %> \
    <li contextmenu="menu"> \
      <img name="icon" src="chrome://mozapps/skin/places/defaultFavicon.png"><span name="title"><%=row["title"]%></span> \
    </li> \
    <% }) %>')

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
 * ¤ui
 */

port.on("update-result", function(entries) {
  $("#result").html(result_template({rows: entries}))
  $("#result li").each(function(i, v) {
    $(this).data(_.extend(entries[i], {idx: i}))
  })
})

port.on("update-icon", function(entry) {
  $("#result li:nth-child("+entry["idx"]+") img").attr("src", entry["url"])
})

var ui_update_entry = function(entry, data) {
  entry.data(data)
  entry.find("span").text(data["title"])
}

var ui_delete_entry = function(entry) {
  entry.remove()
}

/*
 * ¤menu
 */

var ENTRY
$("#result").on("contextmenu", "li", function(e) {
  ENTRY = $(this)
})

$("#menu-edit").on("click", function(e) {
  $("#dlgedit").data("entry", ENTRY.data()).modal("show")
})

$("#menu-delete").on("click", function(e) {
  port.emit("delete-entry", ENTRY.data("idx"))
  ui_delete_entry(ENTRY)
})

/*
 * ¤dialog: Edit Bookmark
 */

var FIELDS = $([
  $("#input-url"),
  $("#input-title"),
  $("#input-tags")
])

$("#dlgedit").on("shown.bs.modal", function(e) {
  $("#input-title").focus()
})

$("#dlgedit").on("show.bs.modal", function(e) {
  var entry = $(this).data("entry")

  $("#input-url").val(entry["url"])
  $("#input-title").val(entry["title"])
  $("#input-tags").val(entry["tags"].join(" "))
})

$("#dlgedit").on("hide.bs.modal", function(e) {
  FIELDS.val("")
})

$("#dlgedit-save").on("click", function(e) {
  var entry = $(this).data("entry")
  var data = {
    url: $("#input-url").val(),
    title: $("#input-title").val(),
    tags: $("#input-tags").val().trim().split(/ +/)
  }

  port.emit("save-entry", entry["idx"], data)
  ui_update_entry(ENTRY, data)

  $(this).dialog("close")
})

$("#dlgedit-form").on("keydown", "input", function(e) {
  if (e.which == KEYCODE["Enter"])  {
    $("#dlgedit-save").trigger("click")  // trigger not work?
  }
})

$(document).ready(function(e) {
  $("#search").focus()
})

// ¤test
//$("#search").val("a").trigger("input")
