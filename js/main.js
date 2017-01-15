$(function() {
  // jQuery extension to show status messages
  $.fn.statusShow = function(msg, msDelay) {
    if (!msDelay) msDelay = 1000;
    this.hide();
    this.html(msg).slideDown(100).delay(msDelay).slideUp(100);
  }

  // global variables
  var initInterval = 25;
  var $resultsDiv = $("section#results");
  var $ckOptSound = $("input#ckOptSound");
	var $btnRaffle = $("a#btnRaffle");
  var $btnStart = $("a#btnStart");
  var $btnReset = $("a#btnReset");
  var $btnStop = $("a#btnStop");

  var deviceDomain = navigator.userAgent.indexOf("Android") > 1 ? "google" : "apple";
  var itemsArr = [];
  var initUserPicksObj = { "items": [] }

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
        $("#button-add-item").click();
      }
    });
    $("#button-add-item").click(function() {
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
              $("#item-status-bubble").css("background-color", "#880000").statusShow("<span><strong>" + val + "</strong> not added: duplicate.</span>", 5000);
            }
          });
        } else {
          // else push single new item onto temp tempUserPickObj
          if (!isDuplicateValue($newUserPick)) {
            tempUserPickObj.items.push(sanitize($newUserPick));
            newPickAdded = true
          } else {
            $("#item-status-bubble").css("background-color", "#880000").statusShow("<span><strong>" + $newUserPick + "</strong> not added: duplicate.</span>", 5000);
          }
        }

        if (newPickAdded) {
          // update localStorage with temp tempUserPickObj
          setLocalStorage("rafflerUserItems", tempUserPickObj);

          // show status bubble
          $("#item-status-bubble").css("background-color", "#008800").statusShow("<span><strong>" + $newUserPick + "</strong> added!</span>");

          updateUserPicksDisplay();
        }
      }
    });
    $("#button-clear-localstorage").click(function() {
      localStorage.clear();
      setLocalStorage("rafflerUserItems", initUserPicksObj);
      initPicksArr();
      updateUserPicksDisplay();
      $("#item-status-bubble").css("background-color", "#847E04").statusShow("<span>User items cleared</span>", 3000);
    });
  }

	function getLocalStorage() {
    return JSON.parse(localStorage.getItem("rafflerUserItems"));
  }
  function setLocalStorage(lsKey, obj) {
    localStorage.setItem(lsKey, JSON.stringify(obj));
    syncUserPicksToPicksArr();
  }

	/*
	  app entry point
		                */
  function initApp() {
    initPicksArr();
    syncUserPicksToPicksArr();
    updateUserPicksDisplay();

    // event handlers
    $btnRaffle.click(function(e) {
      e.preventDefault();
      pickOne();
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

  // init/reset itemsArr with server json
  function initPicksArr() {
    itemsArr.length = 0;
    $.getJSON("json/raffler-data.json", function(jsonServerData) {
      $.each(jsonServerData.items, function(key, val) {
        itemsArr.push(val);
      });
    });
  };

	// get main items array synced with current user items
  function syncUserPicksToPicksArr() {
    $.each(getLocalStorage().items, function(key, val) {
      if (itemsArr.indexOf(val) < 0) {
        itemsArr.push(val);
      }
    });
  }

  // update user items div
  function updateUserPicksDisplay() {
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
			i: 0,
			mult: 1,
      stage: 0,
			names: itemsArr,
			interval: timing,
			callback: callbackFunc,
			stopped: false,
			startCountdown: false,
			runLoop: function() {
				if (variableInterval.stopped) return;
				var result = variableInterval.callback.call(variableInterval);
				if (typeof result == 'number')
				{
					if (result === 0) return;
					variableInterval.interval = result;
				}
				// do something
				$resultsDiv.html("<span>" + variableInterval.names[variableInterval.i++] + "</span>");
				if (variableInterval.i == variableInterval.names.length) variableInterval.i = 0;
				// loop
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

		// print it for the hell of it
		//console.log('interval', interval);
		//console.log('interval mult', this.mult);

		// slow down at a certain point
		if (this.interval > 150) {
      this.stage = 2;
			$resultsDiv.removeClass();
			$resultsDiv.addClass('level2');
      console.log("level2");
		}

		// slow down more at a certain point
		if (this.interval > 250) {
      this.stage = 3;
			$resultsDiv.removeClass();
			$resultsDiv.addClass('level3');
      console.log("level3");
		}

		// stop at a certain point
		if (this.interval > 325) {
      this.stage = 4;
			$resultsDiv.removeClass();
			$resultsDiv.addClass('level4');
			console.log("name picked!");
      this.startCountdown = false;
			this.stop();
      if ($ckOptSound.is(":checked")) {
        var victory = document.getElementsByTagName("audio")[1];
        victory.play();
      }
		}

		// slow countdown over time
		if (this.startCountdown && this.stage == 0) {
      this.stage = 1;
      if (!$resultsDiv.hasClass('level1'))
        $resultsDiv.addClass('level1');

      if ($ckOptSound.is(":checked")) {
        var beep = document.getElementsByTagName("audio")[0];
			  beep.play();
      }
      console.log("level1");
		}
    if (this.stage > 0) {
      return interval + (1.5 ^ this.mult++);
    }
	}, 25);

  // you hit the big button
  function pickOne() {
    countdownTimer.startCountdown = true;
		console.log('countdown started');
  };

  // you hit the reset button
  function resetCountdown() {
    $resultsDiv.removeClass();
    countdownTimer.startCountdown = false;
    countdownTimer.interval = initInterval;
    countdownTimer.mult = 1;
    countdownTimer.stage = 0;
    countdownTimer.start();
    console.log('countdown reset');
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
