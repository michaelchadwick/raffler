/* helper */
/* methods to do little utility things */

if (typeof Raffler !== "undefined") {
  console.log("helper.js: Loaded!");

  Raffler._disableRaffle = function() {
    Raffler.body.removeClass();
    Raffler.btnRaffle.addClass("disabled");
    Raffler.btnTimerStart.removeClass("disabled");
    Raffler.btnTimerStop.removeClass("disabled");
    Raffler.btnRaffle.prop("disabled", true);
    Raffler.btnTimerStart.prop("disabled", false);
    Raffler.btnTimerStop.prop("disabled", false);
  }
  Raffler._enableRaffle = function() {
    Raffler.btnRaffle.removeClass("disabled");
    Raffler.btnTimerStart.addClass("disabled");
    Raffler.btnTimerStop.addClass("disabled");
    Raffler.btnRaffle.prop("disabled", false);
    Raffler.btnTimerStart.prop("disabled", true);
    Raffler.btnTimerStop.prop("disabled", true);
  }
  // encode user entries html
  Raffler._sanitize = function(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/""/g, '&quot;');
  }
  // check for duplicate user entries
  Raffler._isDuplicateValue = function(newUserItem) {
    var curPicks = Raffler._getLocalStorageItem("rafflerUserItems");
    var dupeFound = false;

    $.each(curPicks.items, function(key, val) {
      if (newUserItem == val) {
        dupeFound = true;
        return false;
      }
    });

    return dupeFound;
  }
  // localStorage getter/setter
  Raffler._getLocalStorageItem = function(lsKey) {
    try {
      return JSON.parse(localStorage.getItem(lsKey));
    } catch (e) {
      console.log("_getLocalStorageItem: " + e);
    }
  }
  Raffler._setLocalStorageItem = function(lsKey, obj) {
    try {
      localStorage.setItem(lsKey, JSON.stringify(obj));
    } catch (e) {
      console.log("_setLocalStorageItem: " + e);
    }
  }
  // app notifications
  Raffler._notify = function(msg, type = "", notifyUser = false) {
    var bgColor = "#FFF3BB";
    var color = "#000";
    var header = "Notice";
    var speed = 1500;
    switch (type) {
      case "success":
        bgColor = "#4c8504";
        header = "Success";
        speed = 1500;
        break;
      case "warning":
        bgColor = "#aba909";
        header = "Warning";
        speed = 3000;
        break;
      case "failure":
        bgColor = "#880000";
        color = "#fff";
        header = "Error";
        speed = 5000;
        break;
      default:
        break;
    }

    // 1. notify admin
    console.log("Raffler (" + header + "): " + msg);

    // 2. also notify user
    if (notifyUser) {
      d = document.createElement('div');
      $(d).addClass("item-status")
          .css({
            "background-color": bgColor,
            "color": color
          })
          .html("<strong>" + header + "</strong>: " + msg)
          .prependTo('.main-container')
          .click(function() {
            $(this).remove();
          })
          .hide()
          .slideToggle(200)
          .delay(speed)
          .slideToggle(200)
          .queue(function() {
            $(this).remove();
          });
        }

  }
} else {
  console.log("helper.js: could not be loaded");
}
