self.port.on("show", function(data){
  document.getElementById("input-url").value = data["url"];
  document.getElementById("input-title").value = data["title"];
  document.getElementById("input-tags").value = data["tags"];
});

document.getElementById("button-save").onClick(function() {
  var data = {};
  data["url"] = document.getElementById("input-url");
  data["title"] = document.getElementById("input-title");
  data["tags"] = document.getElementById("input-tags");

  self.port.emit("save", data);
});

document.getElementById("button-cancel").onClick(function() {
  self.port.emit("cancel");
});
