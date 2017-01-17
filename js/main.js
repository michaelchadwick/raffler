$(function() {
  // jQuery extension to show status messages
  $.fn.statusShow = function(msg, msDelay) {
    if (!msDelay) msDelay = 1000;
    this.hide();
    this.html(msg).slideDown(100).delay(msDelay).slideUp(100);
  }

  // global variables
  var itemsArr = [];
  var initUserPicksObj = { "items": [] }
  var initInterval = 25;
  var initMult = 1;
  var lastItemChosen = "";
  var $itemsDiv = $("section#items");
  var $resultsDiv = $("section#results");
  var $resultsTitle = $("section#resultsTitle");
  var $ckOptSound = $("input#ckOptSound");
  var $infoBubble = $("#item-status-bubble");
  var $btnRaffle = $("a#btnRaffle");
  var $btnStart = $("a#btnStart");
  var $btnReset = $("a#btnReset");
  var $btnStop = $("a#btnStop");
  $btnRaffle.focus();

  var deviceDomain = navigator.userAgent.indexOf("Android") > 1 ? "google" : "apple";

  // if we got LS or SS, then set up the user items UI
  var LSsupport = !(typeof window.localStorage == 'undefined');
  var SSsupport = !(typeof window.sessionStorage == 'undefined');
  if (LSsupport && SSsupport) {
    // if our specific key doesn't exist, then init
    if (!localStorage.getItem("rafflerUserItems")) {
      setLocalStorage("rafflerUserItems", initUserPicksObj);
    }
    //// event handlers
    $("#text-add-item").keyup(function(e) {
      var code = e.which;
      if (code == 13) {
        e.preventDefault();
        $("#btnAddItem").click();
      }
    });
    $("#btnAddItem").click(function() {
      var $newUserPick = $("#text-add-item").val().trim();

      if ($newUserPick !== "") {
        var tempUserPickObj = getLocalStorage();
        var newPickAdded = false;

        // if someone adds a list of things, turn into array and then push
        if ($newUserPick.indexOf(',') > -1) {
          $.each($newUserPick.split(','), function(key, val) {
            if (!isDuplicateValue(val)) {
              tempUserPickObj.items.push(sanitize(val));
              newPickAdded = true;
            } else {
              $infoBubble.css("background-color", "#880000").statusShow("<span><strong>" + val + "</strong> not added: duplicate.</span>", 5000);
            }
          });
        } else {
          // else push single new item onto temp tempUserPickObj
          if (!isDuplicateValue($newUserPick)) {
            tempUserPickObj.items.push(sanitize($newUserPick));
            newPickAdded = true
          } else {
            $infoBubble.css("background-color", "#880000").statusShow("<span><strong>" + $newUserPick + "</strong> not added: duplicate.</span>", 5000);
          }
        }

        if (newPickAdded) {
          // update localStorage with temp tempUserPickObj
          setLocalStorage("rafflerUserItems", tempUserPickObj);

          // show status bubble
          $infoBubble.css("background-color", "#008800").statusShow("<span><strong>" + $newUserPick + "</strong> added!</span>");

          updateUserItemsDisplay();
        }
      }
    });
    $("#btnClearLocalStorage").click(function() {
      localStorage.clear();
      setLocalStorage("rafflerUserItems", initUserPicksObj);
      initItemsArr();
      updateUserItemsDisplay();
      $("#text-add-item").val("");
      $infoBubble.css("background-color", "#847E04").statusShow("<span>User items cleared</span>", 1500);
    });
  }

  function getLocalStorage() {
    return JSON.parse(localStorage.getItem("rafflerUserItems"));
  }
  function setLocalStorage(lsKey, obj) {
    localStorage.setItem(lsKey, JSON.stringify(obj));
    syncUserItemsToItemsArr();
  }

  // app entry point
  function initApp() {
    resetApp();

    // event handlers
    $btnRaffle.click(function(e) {
      e.preventDefault();
      if (!$btnRaffle.prop("disabled")) {
        pickOne();
      }
    });
    $btnStart.click(function(e) {
      e.preventDefault();
      countdownTimer.start();
    });
    $btnReset.click(function(e) {
      e.preventDefault();
      resetCountdown();
    });
    $btnStop.click(function(e) {
      e.preventDefault();
      countdownTimer.stop();
    });
  }
  function resetApp() {
    initItemsArr();
    syncUserItemsToItemsArr();
    updateUserItemsDisplay();
    lastItemChosen = "";
  }

  // init/reset itemsArr with server json
  function initItemsArr() {
    itemsArr.length = 0; // clear global itemsArr
    $.getJSON("json/raffler-data.json", function(jsonServerData) {
      $.each(jsonServerData.items, function(key, val) {
        itemsArr.push(val);
      });
    });
  };

  // get main items array synced with current user items
  function syncUserItemsToItemsArr() {
    if(getLocalStorage().items.length > 0) {
      $.each(getLocalStorage().items, function(key, val) {
        if (itemsArr.indexOf(val) < 0) {
          itemsArr.push(val);
        }
      });
    }
  }

  // update user items div
  function updateUserItemsDisplay() {
    var $userPickDiv = $("#user-items");
    if (getLocalStorage()) {
      if(getLocalStorage().items.length > 0) {
        $userPickDiv.html("<span class='heading'>user items</span>: ");
        $userPickDiv.append(getLocalStorage().items.join(', '));
      } else {
        $userPickDiv.html("");
      }
    } else {
      $userPickDiv.html("");
    }
  }

  // timer object to keep track of countdown
  window.setVariableInterval = function(callbackFunc, timing) {
    var variableInterval = {
      mult: initMult,
      stage: 0,
      items: itemsArr,
      interval: timing,
      callback: callbackFunc,
      stopped: false,
      startCountdown: false,
      itemsIndex: Math.floor(Math.random() * itemsArr.length),
      runLoop: function() {
        if (variableInterval.stopped) return;
        var result = variableInterval.callback.call(variableInterval);
        if (typeof result == 'number')
        {
          if (result === 0) return;
          variableInterval.interval = result;
        }
        // switch to next item if countdown not done
        if (variableInterval.stage != 4)
          $itemsDiv.html("<span>" + variableInterval.items[variableInterval.itemsIndex++] + "</span>");
        if (variableInterval.itemsIndex == variableInterval.items.length) variableInterval.itemsIndex = 0;
        // loop
        if (variableInterval.stage != 4)
          variableInterval.loop();
      },
      stop: function() {
        this.stopped = true;
        window.clearTimeout(this.timeout);
      },
      start: function() {
        this.stopped = false;
        return this.loop();
      },
      loop: function() {
        this.timeout = window.setTimeout(this.runLoop, this.interval);
        return this;
      }
    };

    return variableInterval.start();
  };

  // main timer for raffler cycler
  var countdownTimer = setVariableInterval(function() {
    // this is the variableInterval - so we can change/get the interval here:
    var interval = this.interval;

    // debug vars
    //console.log('i', this.i);
    //
    //console.log('interval', this.interval);
    //console.log('interval mult', this.mult);
    //console.log('countdown stage', this.stage);
    //

    // slow down at a certain point
    if (this.interval > 150 &&
        this.interval <= 250) {
      this.stage = 2;
      $itemsDiv.removeClass();
      $itemsDiv.addClass('level2');
      console.log("level2");
    }

    // slow down more at a certain point
    if (this.interval > 250 &&
        this.interval <= 325) {
      this.stage = 3;
      $itemsDiv.removeClass();
      $itemsDiv.addClass('level3');
      console.log("level3");
    }

    // stop and pick an item!
    if (this.interval > 325) {
      this.mult = initMult;
      if (this.interval > 350) this.mult = this.mult++;
      //console.log($itemsDiv.text());
      if (this.interval == 359) {
        this.stage = 4;
        lastItemChosen = $itemsDiv.text();
        this.stop();
        this.startCountdown = false;
        $itemsDiv.removeClass();
        $itemsDiv.addClass('level4');
        //console.log("item picked!", lastItemChosen);
        // play victory sound
        if ($ckOptSound.is(":checked")) {
          var victory = document.getElementById("victory");
          victory.play();
        }
        // re-enable raffle button
        enableRaffle();
        // add to results
        $resultsDiv.append(lastItemChosen + "<br />");
        $resultsTitle.show();
        $resultsDiv.show();
        // show fireworks
        //$("#wrapper").prop("z-index", -1);
        $("section#items").prop("z-index", 1000);
        $("#btnRaffle").prop("z-index", 1000);
        $("canvas").prop("z-index", 999);
        $("canvas").show();
      } else {
        console.log("return2");
        return interval + this.mult;
      }
    }

    // start countdown!
    if (this.startCountdown &&
        (this.stage == 0 || this.stage == 1)) {
      this.stage = 1;
      if (!$itemsDiv.hasClass('level1'))
        $itemsDiv.addClass('level1');

      // play beep boop as items cycle
      if ($ckOptSound.is(":checked")) {
        var beep = document.getElementById("beep");
        beep.play();
      }
      //console.log("level1");
    }
    // if we've started countdown
    // and we haven't reached end
    // then keep cycling with increased multiplier
    if (this.stage > 0 && this.stage != 4) {
      console.log("return1");
      return interval + (1.5 ^ this.mult++);
    }
  }, this.initInterval);

  // you hit the big raffle button
  function pickOne() {
    $("#wrapper").prop("z-index", 0);
    $("section#items").prop("z-index", 0);
    $("#btnRaffle").prop("z-index", 0);
    $("canvas").hide();
    // disable button until countdown done
    disableRaffle();
    // remove last chosen item from itemsArr if anything picked
    if (lastItemChosen !== "") {
      var i = itemsArr.indexOf(lastItemChosen);
      if (i != -1) {
        itemsArr.splice(i, 1);
      }
    }
    //console.log("itemsArr", itemsArr);
    // if we got more than 1 item,
    // then we can raffle
    if (itemsArr.length > 1) {
      $itemsDiv.removeClass();
      countdownTimer.startCountdown = true;
      countdownTimer.interval = initInterval;
      // start new cycle at random spot
      countdownTimer.itemsIndex = Math.floor(Math.random() * itemsArr.length);
      countdownTimer.mult = 1;
      countdownTimer.stage = 1;
      countdownTimer.start();
      console.log('countdown started');
    } else if (itemsArr.length == 1) {
      $itemsDiv.html("<span>" + itemsArr[0] + "</span>");
      $resultsDiv.append($itemsDiv.text());
      $infoBubble.css("background-color", "#880000").statusShow("<span>only one item to raffle!<br /><strong>instant winner!</strong></span>", 5000);
    } else {
      $itemsDiv.html("<span>:'(</span>");
      $infoBubble.css("background-color", "#880000").statusShow("<span>nothing to raffle!<br /><strong>please advise the admin!</strong></span>", 5000);
    }
  };

  // you hit the reset button
  function resetCountdown() {
    resetApp();
    $itemsDiv.removeClass();
    countdownTimer.startCountdown = false;
    countdownTimer.interval = initInterval;
    countdownTimer.mult = initMult;
    countdownTimer.stage = 0;
    countdownTimer.start();
    console.log('countdown reset');
  }

  function disableRaffle() {
    $btnRaffle.addClass("disabled");
    $btnRaffle.prop("disabled", true);
  }
  function enableRaffle() {
    $btnRaffle.removeClass("disabled");
    $btnRaffle.prop("disabled", false);
  }

  // encode user entries html
  function sanitize(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
  }

  // check for duplicate user entries
  function isDuplicateValue(newUserPick) {
    $curPicks = getLocalStorage();
    var dupeFound = false;

    $.each($curPicks.items, function(key, val) {
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
