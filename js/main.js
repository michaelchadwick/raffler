$(function() {
  // jQuery extension to show status messages
  $.fn.statusShow = function(msg, msDelay) {
    if (!msDelay) msDelay = 1000;
    this.hide();
    this.html(msg).slideDown(100).delay(msDelay).slideUp(100);
  }
  $.QueryString = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
      var p=a[i].split('=', 2);
      if (p.length != 2) continue;
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  })(window.location.search.substr(1).split('&'));

  // global variables
  var itemsArr = [];
  var initItemsObj = { "items": [] }
  var initInterval = 25;
  var initMult = 1;
  var lastItemChosen = "";
  var timesRun = 0;
  var lastInterval = 359;
  var hasLSSupport = true;

  // elements to mangle
  var $btnToggleAdminMenu = $('.toggle-button');
  var $menuWrap = $('.menu-wrap');
  var $canvasFireworks = $("canvas");
  var $itemsDiv = $("section#items");
  var $resultsDiv = $("section#results");
  var $resultsContent = $("section#results div ul");
  var $ckOptSound = $("input#ckOptSound");
  var $ckOptFireworks = $("input#ckOptFireworks");
  var $infoBubble = $("#item-status-bubble");
  var $btnRaffle = $("a#btnRaffle");
  var $btnStartTimer = $("a#btnStart");
  var $btnResetData = $("a#btnResetData");
  var $inputAddUserItem = $("#text-add-user-item");
  var $btnAddUserItem = $("#btnAddUserItem");
  var $btnClearUserItems = $("#btnClearUserItems");
  var $textServerItems = $("#serverItems textarea");
  var $btnStopTimer = $("a#btnStop");

  var deviceDomain = navigator.userAgent.indexOf("Android") > 1 ? "google" : "apple";

  // if admin passed, show hamburger menu
  if (typeof $.QueryString['admin'] !== "undefined" || true) {
    $('.toggle-button').show();
  }

  function getLocalStorage(lsKey) {
    return JSON.parse(localStorage.getItem(lsKey));
  }
  function setLocalStorage(lsKey, obj) {
    localStorage.setItem(lsKey, JSON.stringify(obj));
    syncUserItemsToItemsArr();
  }

  // app entry point
  function initApp() {
    checkForLS();
    resetApp();
    setEventHandlers();
    $inputAddUserItem.text("");
    $btnRaffle.focus();
  }
  // check for localStorage support
  function checkForLS() {
    // if we got LS or SS, then set up the user items UI
    var LSsupport = !(typeof window.localStorage == 'undefined');
    var SSsupport = !(typeof window.sessionStorage == 'undefined');
    if (!LSsupport && !SSsupport) {
      hasLSSupport = false;
      $infoBubble.css("background-color", "#880000")
        .statusShow("No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don't reload!", 5000);
    } else {
      // if our specific keys don't exist, then init
      if (!localStorage.getItem("rafflerUserItems")) {
        setLocalStorage("rafflerUserItems", initItemsObj);
      }
      if (!localStorage.getItem("rafflerChosenItems")) {
        setLocalStorage("rafflerChosenItems", initItemsObj);
      } else {
        
      }
    }
  }
  function resetApp() {
    initItemsArr();
    syncUserItemsToItemsArr();
    syncChosenItemsToItemsArr();
    updateUserItemsDisplay();
    lastItemChosen = "";
  }
  function setEventHandlers() {
    $btnToggleAdminMenu.on('click', function() {
      $(this).toggleClass('button-open');
      $menuWrap.toggleClass('menu-show');
    });
    $btnRaffle.click(function(e) {
      e.preventDefault();
      if (!$btnRaffle.prop("disabled")) {
        pickOne();
      }
    });
    $btnStartTimer.click(function(e) {
      e.preventDefault();
      countdownTimer.start();
    });
    $btnStopTimer.click(function(e) {
      e.preventDefault();
      countdownTimer.stop();
    });
    $btnResetData.click(function(e) {
      e.preventDefault();
      $("#resetDataDialog").dialog({
        autoOpen: false,
        modal: true,
        resizeable: false,
        height: "auto",
        buttons: {
          "Reset it!" : function() {
            resetCountdown();
            $(this).dialog("close");
          },
          "Nevermind." : function() {
            $(this).dialog("close");
          }
        }
      });

      $("#resetDataDialog").dialog("open");
    });
    $inputAddUserItem.keyup(function(e) {
      var code = e.which;
      if (code == 13) {
        e.preventDefault();
        $btnAddUserItem.click();
      }
    });
    $btnAddUserItem.click(function() {
      var $newUserPick = $inputAddUserItem.val().trim();

      if ($newUserPick !== "") {
        var tempUserPickObj = getLocalStorage("rafflerUserItems");
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
    $btnClearUserItems.click(function(e) {
      e.preventDefault();
      $("#clearUserItemsDialog").dialog({
        autoOpen: false,
        modal: true,
        resizeable: false,
        height: "auto",
        buttons: {
          "Clear them!" : function() {
            localStorage.removeItem("rafflerUserItems");
            setLocalStorage("rafflerUserItems", initItemsObj);
            initItemsArr();
            updateUserItemsDisplay();
            $inputAddUserItem.val("");
            $infoBubble.css("background-color", "#847E04").statusShow("<span>User items cleared</span>", 1500);
            $(this).dialog("close");
          },
          "Nevermind." : function() {
            $(this).dialog("close");
          }
        }
      });

      $("#clearUserItemsDialog").dialog("open");
    });
  }
  
  // init/reset itemsArr with server json
  function initItemsArr() {
    itemsArr.length = 0; // clear global itemsArr
    $.getJSON("json/raffler-initial.json", function(data) {
      $.each(data.items, function(key, val) {
        itemsArr.push(val);
        $textServerItems.append(val + "\n");
      });
    });
  };

  // add user items to main items array
  function syncUserItemsToItemsArr() {
    if(getLocalStorage("rafflerUserItems").items.length > 0) {
      $.each(getLocalStorage("rafflerUserItems").items, function(key, val) {
        if (itemsArr.indexOf(val) < 0) {
          itemsArr.push(val);
        }
      });
    }
  }
  // remove chosen items from main items array if we've already used raffler
  function syncChosenItemsToItemsArr() {
    var chosenItemIndex = 0;
    if(getLocalStorage("rafflerChosenItems").items.length > 0) {
      $.each(getLocalStorage("rafflerChosenItems").items, function(key, val) {
        console.log("val", val);
        console.log(itemsArr);
        chosenItemIndex = itemsArr.indexOf(val);
        console.log("index", chosenItemIndex);
        if (chosenItemIndex >= 0) {
          itemsArr.splice(chosenItemIndex, 1);
          $textServerItems.append(val + "\n");
          $resultsContent.append("<li>" + lastItemChosen + "</li>");
          $resultsDiv.show();
        }
        console.log(itemsArr);
      });
    }
  }
  
  // reset chosen items back to none
  function resetChosenItems() {
    setLocalStorage("rafflerChosenItems", initItemsObj);
  }

  // update user items div
  function updateUserItemsDisplay() {
    var $userPickDiv = $("#user-items");
    if (getLocalStorage("rafflerUserItems")) {
      if(getLocalStorage("rafflerUserItems").items.length > 0) {
        $userPickDiv.html("<span class='heading'>user items</span>: ");
        $userPickDiv.append(getLocalStorage("rafflerUserItems").items.join(', '));
      } else {
        $userPickDiv.html("");
      }
    } else {
      $userPickDiv.html("");
    }
  }
  
  // update LS chosen items
  function updateChosenItemsLS(item) {
    var tempChosenPicksObj = getLocalStorage("rafflerChosenItems");
    tempChosenPicksObj.items.push(sanitize(item));
    setLocalStorage("rafflerChosenItems", tempChosenPicksObj);
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

    // slow down at a certain point
    if (this.interval > 150 &&
        this.interval <= 250) {
      this.stage = 2;
      $itemsDiv.removeClass();
      $itemsDiv.addClass('level2');

    }

    // slow down more at a certain point
    if (this.interval > 250 &&
        this.interval <= 325) {
      this.stage = 3;
      $itemsDiv.removeClass();
      $itemsDiv.addClass('level3');

    }

    // stop and pick an item!
    if (this.interval > 325) {
      this.mult = initMult;
      if (this.interval > 350) this.mult = this.mult++;
      // adjust for odd time drift
      if (timesRun > 0) lastInterval = 349;
      if (this.interval >= lastInterval) {
        this.stage = 4;
        lastItemChosen = $itemsDiv.text();
        this.stop();
        this.startCountdown = false;
        $itemsDiv.removeClass();
        $itemsDiv.addClass('level4');

        // play victory sound
        if ($ckOptSound.is(":checked")) {
          var victory = document.getElementById("victory");
          victory.play();
        }
        // re-enable raffle button
        enableRaffle();
        // add to results
        $resultsContent.append("<li>" + lastItemChosen + "</li>");
        updateChosenItemsLS(lastItemChosen);
        $resultsDiv.show();
        // show fireworks
        if ($ckOptFireworks.is(":checked")) {
          displayFireworks();
        }
        timesRun++;
        // add to admin list of winners
        $("#winners textarea").append(lastItemChosen + "\n");
        // remove last chosen item from itemsArr if anything picked
        if (lastItemChosen !== "") {
          var i = itemsArr.indexOf(lastItemChosen);
          if (i != -1) {
            itemsArr.splice(i, 1);
          }
        }
        // update admin serverItems
        $textServerItems.text("");
        itemsArr.forEach(function(item) {
          $textServerItems.append(item + "\n");
        });
      } else {

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

    }
    // if we've started countdown
    // and we haven't reached end
    // then keep cycling with increased multiplier
    if (this.stage > 0 && this.stage != 4) {
      return interval + (1.5 ^ this.mult++);
    }
  }, initInterval);

  // you hit the big raffle button
  function pickOne() {
    hideFireworks();
    // disable button until countdown done
    disableRaffle();


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

    } else if (itemsArr.length == 1) {
      $itemsDiv.html("<span>" + itemsArr[0] + "</span>");
      $resultsContent.append($itemsDiv.text());
      $infoBubble.css("background-color", "#880000").statusShow("<span>only one item to raffle!<br /><strong>instant winner!</strong></span>", 5000);
    } else {
      $itemsDiv.html("<span>:'(</span>");
      $infoBubble.css("background-color", "#880000").statusShow("<span>nothing to raffle!<br /><strong>please advise the admin!</strong></span>", 5000);
    }
  };

  // you hit the reset button
  // puts everyone back in raffle
  // resets stuff, as if you reloaded page
  function resetCountdown() {
    resetApp();
    resetChosenItems();
    $itemsDiv.removeClass();
    $resultsContent.text("");
    $textServerItems.text("");
    $resultsDiv.hide();
    countdownTimer.startCountdown = false;
    countdownTimer.interval = initInterval;
    countdownTimer.mult = initMult;
    countdownTimer.stage = 0;
    countdownTimer.start();
  }

  function disableRaffle() {
    $btnRaffle.addClass("disabled");
    $btnRaffle.prop("disabled", true);
  }
  function enableRaffle() {
    $btnRaffle.removeClass("disabled");
    $btnRaffle.prop("disabled", false);
  }
  function hideFireworks() {
    $("#wrapper").prop("z-index", 0);
    $itemsDiv.prop("z-index", 0);
    $btnRaffle.prop("z-index", 0);
    $canvasFireworks.hide();
  }
  function displayFireworks() {
    $itemsDiv.prop("z-index", 1000);
    $btnRaffle.prop("z-index", 1000);
    $canvasFireworks.prop("z-index", 999);
    $canvasFireworks.show();
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
    $curPicks = getLocalStorage("rafflerUserItems");
    var dupeFound = false;

    $.each($curPicks.items, function(key, val) {


      if (newUserPick == val) {

        dupeFound = true;
        return false;
      }
    })

    return dupeFound;
  }
  // get querystring
  function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  }

  // start it all up
  initApp();
});
