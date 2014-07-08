var Hotkey = require("sdk/hotkeys").Hotkey
var ui = require("sdk/ui")
var self = require("sdk/self")
var tabs = require("sdk/tabs")
var getFavicon = require("sdk/places/favicon").getFavicon
var windows = require("sdk/windows").browserWindows
var window = require("sdk/window/utils")
var PageMod = require("sdk/page-mod").PageMod
var bookmarks = require("sdk/places/bookmarks")
var prefs = require("sdk/simple-prefs").prefs
var system = require("sdk/system")


// lib
var pd = function() { console.log.apply(console, arguments) }
var set2array = function(set) { return [x for (x of set)] }

var TAG_ALIAS = {}
prefs["tag_alias"].trim().split(/[ ]+/).forEach(function(text) {
  var val = text.split(","),
      origin = val[0],
      aliases = val.slice(1)
  aliases.forEach(function(v) {
    TAG_ALIAS[v] = origin
  })
})

var apply_tag_alias = function(tags) {
  return tags.map(function(v) {
    return TAG_ALIAS[v] || v
  })
}

pd('load', self.data.url('logo.png'), self.data.url('bookmarks.html'))
ui.ActionButton({
  id: "guten-bookmarks",
  label: "Guten Bookmarks",
  icon: "./logo.png",
  onClick: function() {
    pd('click')
    var browser = window.getMostRecentBrowserWindow()
    browser.open.apply(browser, [self.data.url("bookmarks.html"), "_blank", "width=800,height=400,chrome=on", null])
    //window.openDialog({url: self.data.url("bookmarks.html"), features: "width=800,height=400,chrome=on"})
  }
})

PageMod({
  include: self.data.url("bookmarks.html"),

  contentScriptFile: [
    self.data.url("vendor/jquery.min.js"),
    self.data.url("vendor/rivets.min.js"),
    self.data.url("vendor/bootstrap.min.js"),
    self.data.url("bookmarks.js")
  ],

  onAttach: function(walker) {
    var port = walker.port,
        ENTRIES = null

    port.on("search", function(text) {
      var tags = text.trim().split(/[ ]+/)
      tags = apply_tag_alias(tags)

      bookmarks.search({tags: tags}, {sort: "visitCount", descending: true}).on("end", function(entries) {
        entries.forEach(function(v, i) {
          v["icon"] = "chrome://mozapps/skin/places/defaultFavicon.png"
          v["tags"] = set2array(v["tags"])
          v["idx"] = i
        })
        ENTRIES = entries
        port.emit("update-result", entries)

        entries.forEach(function(entry, i) {
          getFavicon(entry["url"], function(url) {
            if (!url) {
              return
            }
            port.emit("update-icon", {idx: i, icon: url})
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

if (system.env["DEBUG"]) {
  tabs.open(self.data.url("bookmarks.html"))
}
