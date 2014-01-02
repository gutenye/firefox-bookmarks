Hotkey = require("sdk/hotkeys").Hotkey
Widget = require("sdk/widget").Widget
data = require("sdk/self").data
tabs = require("sdk/tabs")
getFavicon = require("sdk/places/favicon").getFavicon
windows = require("sdk/windows").browserWindows
window = require("sdk/window/utils")
PageMod = require("sdk/page-mod").PageMod
bookmarks = require("sdk/places/bookmarks")
prefs = require("sdk/simple-prefs").prefs

# lib
pd = -> console.log.apply(console, arguments) 
set2array = (set) -> x for x in set

TAG_ALIAS = {}
prefs["tag_alias"].trim().split(/[ ]+/).forEach (text) ->
  [origin, aliases...] = text.split(",")
  aliases.forEach (v) ->
    TAG_ALIAS[v] = origin

apply_tag_alias = (tags) -> (TAG_ALIAS[v] ? v for v in tags)

Widget
  id: "bookmarks"
  label: "Bookmarks"
  contentURL: data.url("bookmarks.png")
  onClick: ->
    browser = window.getMostRecentBrowserWindow()
    browser.open.apply(browser, [data.url("bookmarks.html"), "_blank", "width=800,height=400,chrome=on", null]) 
    #window.openDialog({url: data.url("bookmarks.html"), features: "width=800,height=400,chrome=on"})

PageMod
  include: data.url("bookmarks.html")
  contentScriptFile: [
    data.url("vendor/jquery.min.js")
    data.url("vendor/rivets.min.js")
    data.url("vendor/bootstrap.min.js")
    data.url("bookmarks.js") ]

  onAttach: (walker) ->
    port = walker.port
    ENTRIES = null
    
    port.on "search", (text) ->
      tags = text.trim().split(/[ ]+/)
      tags = apply_tag_alias(tags)

      bookmarks.search({tags: tags}, {sort: "visitCount", descending: true}).on "end", (entries) ->
        entries.forEach (v) ->
          v["icon"] = "chrome://mozapps/skin/places/defaultFavicon.png"
          v["tags"] = set2array(v["tags"])
        ENTRIES = entries
        port.emit "update-result", entries
        
        entries.forEach (entry, i) ->
          getFavicon entry["url"], (url) ->
            return if not url
            port.emit "update-icon", {idx: i, icon: url}

    port.on "click-entry", (url) ->
      windows[0].tabs.open url
      windows[0].activate()

    port.on "save-entry", (index, data) ->
      entry = ENTRIES[index]
      entry["title"] = data["title"]
      entry["url"] = data["url"]
      entry["tags"] = data["tags"]
      bookmarks.save entry

    port.on "delete-entry", (index) ->
      bookmarks.save bookmarks.remove(ENTRIES[index])

# ¤test
tabs.open data.url("bookmarks.html")
