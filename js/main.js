$(function() {
  // jQuery extension to show status messages
  $.fn.statusShow = function(msg, msDelay) {
    if (!msDelay) msDelay = 1000;
    this.hide();
    this.html(msg).slideDown(100).delay(msDelay).slideUp(100);
  }

  // global variables
  var $resultsDiv = $("section#the-results");
	var $bigButton = $("a#button-to-push");
	
  var deviceDomain = navigator.userAgent.indexOf("Android") > 1 ? "google" : "apple";
  var itemsArr = [];
	var animFast = "";
	var i = 0;
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

  function initApp() {
    initPicksArr();
    syncUserPicksToPicksArr();
    updateUserPicksDisplay();
    $bigButton.click(function(e) {
      e.preventDefault();
      pickOne();
    });
		animateText();
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

	function animateText() {
		animFast = setInterval(function() {
			$resultsDiv.html(itemsArr[i]);
			i++;
			if (i > itemsArr.length) i = 0;
		},50);
	}

  function getLocalStorage() {
    return JSON.parse(localStorage.getItem("rafflerUserItems"));
  }

  function setLocalStorage(lsKey, obj) {
    localStorage.setItem(lsKey, JSON.stringify(obj));
    syncUserPicksToPicksArr();
  }

  // you hit the big button
  function pickOne() {
		// stop cycling
		clearInterval(animFast);
		console.log("countAnimMed started");

		var countAnimMed = 3;
		var animMed = setInterval(function() {
			$resultsDiv.html(itemsArr[i]);
			i++;
			if (i > itemsArr.length) {
				i = 0;
				countAnimMed--;
				if (countAnimMed == 0) {
					clearInterval(animMed);
					$resultsDiv.addClass("decided1");
					console.log("countAnimSlow started");
				}
			}
		},100);

		var countAnimSlow = 2;
		var animSlow = setInterval(function() {
			$resultsDiv.html(itemsArr[i]);
			i++;
			if (i > itemsArr.length) {
				i = 0;
				countAnimSlow--;
				if (countAnimSlow == 0) {
					clearInterval(animSlow);
					$resultsDiv.addClass("decided2");
					console.log("countAnimOMG started");
				}
			}
		},200);
		
		var countAnimOMG = 1;
		var animOMG = setInterval(function() {
			$resultsDiv.html(itemsArr[i]);
			i++;
			if (i > itemsArr.length) {
				i = 0;
				countAnimOMG--;
				if (countAnimOMG == 0) {
					clearInterval(animOMG);
					$resultsDiv.addClass("decided3");
				}
			}
		},300);
		
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
