var Hotkey = require("sdk/hotkeys").Hotkey
var Widget = require("sdk/widget").Widget
var data = require("sdk/self").data
var tabs = require("sdk/tabs")
var getFavicon = require("sdk/places/favicon").getFavicon
var windows = require("sdk/windows").browserWindows
var window = require("sdk/window/utils")
var PageMod = require("sdk/page-mod").PageMod
var bookmarks = require("sdk/places/bookmarks")
var pd = function() { console.log.apply(console, arguments) }

Widget({
  id: "bookmarks",
  label: "Bookmarks",
  contentURL: data.url("bookmarks.png"),
  onClick: function() {
    var browser = window.getMostRecentBrowserWindow()
    browser.open.apply(browser, [data.url("bookmarks.html"), "_blank", "width=800,height=400,chrome=on", null]) 
    //window.openDialog({url: data.url("bookmarks.html"), features: "width=800,height=400,chrome=on"})
  }
})

PageMod({
  include: data.url("bookmarks.html"),
  contentScriptFile: [
    data.url("vendor/underscore.min.js"), 
    data.url("vendor/jquery.min.js"),
    data.url("vendor/rivets.min.js"),
    data.url("vendor/bootstrap.min.js"),
    data.url("bookmarks.js")],

  onAttach: function(walker) {
    var port = walker.port
    var ENTRIES

    port.on("search", function(text) {
      var tags = text.trim().split(/ +/)

      bookmarks.search({tags: tags}, {sort: "visitCount", descending: true}).on("end", function(entries) {
        entries.map(function(v){ v["tags"] = [x for (x of v["tags"])] })
        ENTRIES = entries
        port.emit("update-result", entries)

        entries.forEach(function(entry, i){
          getFavicon(entry["url"], function(url){
            if (! url)
              return

            port.emit("update-icon", {idx: i+1, url: url})
          })
        })
      })
    })

    port.on("click-entry", function(url) {
      windows[0].tabs.open(url)
      windows[0].activate()
    })

    port.on("save-entry", function(index, data) {
      var entry = ENTRIES[index]
      entry["title"] = data["title"]
      entry["url"] = data["url"]
      entry["tags"] = data["tags"]
      bookmarks.save(entry)
    })

    port.on("delete-entry", function(index) {
      bookmarks.save(bookmarks.remove(ENTRIES[index]))
    })
  }
})


// ¤test
//tabs.open(data.url("bookmarks.html"))
