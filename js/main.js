$(function() {
  // jQuery extension to show status messages
  $.fn.statusShow = function(msg, msDelay) {
    if (!msDelay) msDelay = 1000;
    this.hide();
    this.html(msg).slideDown(100).delay(msDelay).slideUp(100);
  }

  // global variables
  var $pickPlace = $("section#the-pick-place");
  var $linkChoicesDiv = $("section#search-or-directions");
  var deviceDomain = navigator.userAgent.indexOf("Android") > 1 ? "google" : "apple";
  var lastPick = "";
  var picksArr = [];
  var initUserPicksObj = { "names": [] }

  // if we got LS or SS, then set up the user picks UI
  var LSsupport = !(typeof window.localStorage == 'undefined');
  var SSsupport = !(typeof window.sessionStorage == 'undefined');
  if (LSsupport && SSsupport) {
    // if our specific key doesn't exist, then init
    if (!localStorage.getItem("userPicks")) {
      setLocalStorage("userPicks", initUserPicksObj);
    }
    // event handlers
    $("#text-add-pick").keyup(function(e) {
      var code = e.which;
      if (code == 13) {
        e.preventDefault();
        $("#button-add-pick").click();
      }
    });
    $("#button-add-pick").click(function() {
      var $newUserPick = $("#text-add-pick").val().trim();

      if ($newUserPick !== "") {
        var tempUserPickObj = getLocalStorage();
        var newPickAdded = false;

        // if someone adds a list of things, turn into array and then push
        if ($newUserPick.indexOf(',') > -1) {
          $.each($newUserPick.split(','), function(key, val) {
            if (!isDuplicateValue(val)) {
              tempUserPickObj.picks.push(sanitize(val));
              newPickAdded = true;
            } else {
              $("#pick-status-bubble").css("background-color", "#880000").statusShow("<span><strong>" + val + "</strong> not added: duplicate.</span>");
            }
          });
        } else {
          // else push single new pick onto temp tempUserPickObj
          if (!isDuplicateValue($newUserPick)) {
            tempUserPickObj.picks.push(sanitize($newUserPick));
            newPickAdded = true
          } else {
            $("#pick-status-bubble").css("background-color", "#880000").statusShow("<span><strong>" + $newUserPick + "</strong> not added: duplicate.</span>");
          }
        }

        if (newPickAdded) {
          // update localStorage with temp tempUserPickObj
          setLocalStorage("userPicks", tempUserPickObj);

          // show status bubble
          $("#pick-status-bubble").css("background-color", "#008800").statusShow("<span><strong>" + $newUserPick + "</strong> added!</span>");

          updateUserPicksDisplay();
        }
      }
    });
    $("#button-clear-localstorage").click(function() {
      localStorage.clear();
      setLocalStorage("userPicks", initUserPicksObj);
      initPicksArr();
      updateUserPicksDisplay();
      $("#pick-status-bubble").css("background-color", "#847E04").statusShow("<span>User picks cleared</span>", 2000);
    });
  }

  function initApp() {
    initPicksArr();
    syncUserPicksToPicksArr();
    updateUserPicksDisplay();
    $("#button-just-pick-one").click(function(e) {
      e.preventDefault();
      pickOne();
    });
  }

  // init/reset picksArr with server json
  function initPicksArr() {
    picksArr.length = 0;
    $.getJSON("json/raffler-data.json", function(jsonServerData) {
      $.each(jsonServerData.picks, function(key, val) {
        picksArr.push(val);
      });
    });
  };

  // update user picks div
  function updateUserPicksDisplay() {
    var $userPickDiv = $("#user-picks");
    if (getLocalStorage()) {
      if(getLocalStorage().picks.length > 0) {
        $userPickDiv.html("<span class='heading'>user picks</span>: ");
        $userPickDiv.append(getLocalStorage().picks.join(', '));
      } else {
        $userPickDiv.html("");
      }
    } else {
      $userPickDiv.html("");
    }
  }

  // get main picks array synced with current user picks
  function syncUserPicksToPicksArr() {
    $.each(getLocalStorage().picks, function(key, val) {
      if (picksArr.indexOf(val) < 0) {
        picksArr.push(val);
      }
    });
  }

  function getLocalStorage() {
    return JSON.parse(localStorage.getItem("userPicks"));
  }

  function setLocalStorage(lsKey, obj) {
    localStorage.setItem(lsKey, JSON.stringify(obj));
    syncUserPicksToPicksArr();
  }

  // you hit the big button
  function pickOne() {
    var curPick = "";

    // keep grabbing new picks from our array
    // until it doesn't match the last one
    while ((curPick = picksArr[Math.floor(Math.random() * picksArr.length)]) === lastPick) {}

    // remember last pick
    lastPick = curPick;

    // replace choice with curPick
    $pickPlace.fadeOut(100, function() {
      $(this).addClass("decided")
      $(this).html(curPick + "!")
      .fadeIn(50);

      // show
      if ($linkChoicesDiv.css("display", "none")) {
        $linkChoicesDiv.show();
      }

      // clear it before adding new links
      $linkChoicesDiv.html("");

      // clean up the search term
      curPick = curPick.replace(" ","+").replace("'","");
    });
  };

  // encode html
  function sanitize(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
  }

  // check for duplicate entries
  function isDuplicateValue(newUserPick) {
    $curPicks = getLocalStorage();
    var dupeFound = false;

    $.each($curPicks.picks, function(key, val) {
      console.log("newUserPick", newUserPick);
      console.log("val", val);
      if (newUserPick == val) {
        console.log("found a dupe");
        dupeFound = true;
        return false;
      }
    })

    return dupeFound;
  }

  initApp();
});
