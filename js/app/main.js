require(['jquery', 'jquery-ui', 'app/fx'], function($) {

  var Raffler = {};

  $(function() {
    // global variables
    Raffler.itemsArr =        [];
    Raffler.initItemsObj =    { "items": [] }
    Raffler.initInterval =    25;
    Raffler.initMult =        1;
    Raffler.lastItemChosen =  "";
    Raffler.timesRun =        0;
    Raffler.lastInterval =    359;
    Raffler.hasLSSupport =    true;

    // main divs/elements
    Raffler.divMenuWrap =             $('div#menu-wrap');
    Raffler.divMainWrapper =          $('div#wrapper');
    Raffler.divItemsCycle =           $('div#items-cycle');
    Raffler.divResultsWrapper =       $('div#results-wrapper');
    Raffler.divResultsContent =       $('div#results-wrapper div ul');
    Raffler.divUserItems =            $('div#user-items');
    Raffler.divDataResetDialog =      $('div#data-reset-dialog');
    Raffler.divUserItemsClearDialog = $('div#user-items-clear-dialog');
    Raffler.divItemStatusBubble =     $('div#item-status-bubble');
    Raffler.canvasFireworks =         $('canvas');

    // clicky things
    Raffler.btnAdminMenuToggle =      $('span#button-admin-menu-toggle');
    Raffler.btnRaffle =               $('a#button-raffle');
    Raffler.btnTimerStart =           $('a#button-timer-start');
    Raffler.btnTimerStop =            $('a#button-timer-stop');
    Raffler.btnDataReset =            $('a#button-data-reset');
    Raffler.btnUserItemsAdd =         $('button#button-user-items-add');
    Raffler.btnUserItemsClear =       $('button#button-user-items-clear');

    // optiony things
    Raffler.ckOptSound =              $('input#check-option-sound');
    Raffler.ckOptFireworks =          $('input#check-option-fireworks');
    
    // textual input things
    Raffler.inputUserItemsAdd =       $('input#text-user-items-add');
    Raffler.textAvailableItems =      $('div#items-available textarea');
    Raffler.textChosenItems =         $('div#items-chosen textarea');

    Array.prototype.clear = function() {
      while (this.length) { this.pop(); }
    };
    // jQuery extension to show status messages
    $.fn.statusShow = function(msg, msDelay) {
      if (!msDelay) msDelay = 1000;
      this.hide();
      this.html(msg).slideDown(100).delay(msDelay).slideUp(100);
    }
    // jQuery extension to parse url querystring
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
    // if admin passed, show hamburger menu
    if (typeof $.QueryString['admin'] !== "undefined" || true) {
      Raffler.btnAdminMenuToggle.show();
    }

    // app entry point
    Raffler.initApp = function() {
      Raffler.checkForLS();
      Raffler.setEventHandlers();
      Raffler.resetApp();
      Raffler.btnRaffle.focus();
      
      Raffler.notify("App init");
    }
    // check for localStorage support
    Raffler.checkForLS = function() {
      // if we got LS or SS, then set up the user items UI
      var LSsupport = !(typeof window.localStorage == 'undefined');
      var SSsupport = !(typeof window.sessionStorage == 'undefined');
      if (!LSsupport && !SSsupport) {
        Raffler.hasLSSupport = false;
        Raffler.notify("No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don't reload!", "failure");
      } else {
        // if our specific keys don't exist, then init
        if (!localStorage.getItem("rafflerUserItems")) {
          Raffler.setLSItem("rafflerUserItems", Raffler.initItemsObj);
        }
        if (!localStorage.getItem("rafflerChosenItems")) {
          Raffler.setLSItem("rafflerChosenItems", Raffler.initItemsObj);
        } else {
          Raffler.syncChosenItemsToItemsArr();
        }
      }
    }
    Raffler.setEventHandlers = function() {
      Raffler.btnAdminMenuToggle.on('click', function() {
        $(this).toggleClass('button-open');
        Raffler.divMenuWrap.toggleClass('menu-show');
      });
      Raffler.btnRaffle.click(function(e) {
        e.preventDefault();
        if (!Raffler.btnRaffle.prop("disabled")) {
          Raffler.pickOne();
        }
      });
      Raffler.btnTimerStart.click(function(e) {
        e.preventDefault();
        countdownTimer.start();
      });
      Raffler.btnTimerStop.click(function(e) {
        e.preventDefault();
        countdownTimer.stop();
      });
      Raffler.btnDataReset.click(function(e) {
        e.preventDefault();
        Raffler.divDataResetDialog.dialog({
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

        Raffler.divDataResetDialog.dialog("open");
      });
      Raffler.inputUserItemsAdd.keyup(function(e) {
        var code = e.which;
        if (code == 13) {
          e.preventDefault();
          Raffler.btnUserItemsAdd.click();
        }
      });
      Raffler.btnUserItemsAdd.click(function() {
        if (Raffler.inputUserItemsAdd.val() !== "" || Raffler.inputUserItemsAdd.val() !== undefined) {
          var $newUserItem = Raffler.inputUserItemsAdd.val().trim();

          if ($newUserItem !== "") {
            var tempUserItemObj = getLSItem("rafflerUserItems");
            var newPickAdded = false;

            // if someone adds a list of things, turn into array and then push
            if ($newUserItem.indexOf(',') > -1) {
              $.each($newUserItem.split(','), function(key, val) {
                if (!isDuplicateValue(val)) {
                  tempUserItemObj.items.push(sanitize(val));
                  newPickAdded = true;
                  Raffler.btnUserItemsClear.prop("disabled", false);
                  Raffler.btnUserItemsClear.removeClass();
                } else {
                  Raffler.notify("<strong>" + val + "</strong> not added: duplicate.", "failure");
                }
              });
            } else {
              // else push single new item onto temp tempUserItemObj
              if (!isDuplicateValue($newUserItem)) {
                tempUserItemObj.items.push(sanitize($newUserItem));
                newPickAdded = true
                Raffler.btnUserItemsClear.prop("disabled", false);
                Raffler.btnUserItemsClear.removeClass();
              } else {
                Raffler.notify("<strong>" + $newUserItem + "</strong> not added: duplicate.", "failure");
              }
            }

            if (newPickAdded) {
              // update localStorage with temp tempUserItemObj
              setLSItem("rafflerUserItems", tempUserItemObj);
              // show status bubble
              Raffler.notify("<strong>" + $newUserItem + "</strong> added!", "success");
              updateUserItemsDisplay();
            }
          }
        }
      });
      Raffler.btnUserItemsClear.click(function(e) {
        e.preventDefault();
        if (getLSItem("rafflerUserItems").items.length > 0) {
          Raffler.btnUserItemsClear.prop("disabled", false);
          Raffler.btnUserItemsClear.removeClass();

          Raffler.divUserItemsClearDialog.dialog({
            autoOpen: false,
            modal: true,
            resizeable: false,
            height: "auto",
            buttons: {
              "Clear them!" : function() {
                resetUserItems();
                initItemsArr();

                Raffler.inputUserItemsAdd.val("");

                Raffler.btnUserItemsClear.prop("disabled", true);
                Raffler.btnUserItemsClear.addClass("disabled");

                Raffler.notify("User items cleared", "success");

                $(this).dialog("close");
              },
              "Nevermind." : function() {
                $(this).dialog("close");
              }
            }
          });

          Raffler.divUserItemsClearDialog.dialog("open");
        }
      });
    }
    Raffler.resetApp = function() {
      Raffler.initItemsArr();
      Raffler.syncUserItemsToItemsArr();

      Raffler.updateUserItemsDisplay();
      Raffler.lastItemChosen = "";
      Raffler.notify("App reset");
    }

    // init/reset Raffler.itemsArr with server json
    Raffler.initItemsArr = function() {
      console.log("initItemsArr before getJSON", Raffler.itemsArr);
      $.getJSON("json/raffler-initial.json", function(data) {
        Raffler.itemsArr.clear(); // clear global Raffler.itemsArr
        Raffler.itemsArr.length = 0;
        console.log("initItemsArr getJSON top", Raffler.itemsArr);
        $.each(data.items, function(key, val) {
          Raffler.itemsArr[Raffler.itemsArr.length] = val;
          console.log("Raffler.itemsArr length (in each loop)", Raffler.itemsArr.length);
          Raffler.textAvailableItems.append(val + "\n");
        });
        console.log("Raffler.itemsArr length (post-each)", Raffler.itemsArr.length);
      });
      console.log("Raffler.itemsArr length (post getJSON)", Raffler.itemsArr.length);
      Raffler.syncChosenItemsToItemsArr();
    };
    // add user items to main items array
    Raffler.syncUserItemsToItemsArr = function() {
      var userItems = Raffler.getLSItem("rafflerUserItems").items;
      Raffler.inputUserItemsAdd.text("");
      if(userItems.length > 0 && Raffler.hasLSSupport) {
        Raffler.btnUserItemsClear.prop("disabled", false);
        Raffler.btnUserItemsClear.removeClass();
        $.each(userItems.items, function(key, val) {
          if (Raffler.itemsArr.indexOf(val) < 0) {
            Raffler.itemsArr.push(val);
          }
        });
      }
    }
    // remove chosen items from main items array
    // if we've already used raffler
    // and add names to results div
    Raffler.syncChosenItemsToItemsArr = function() {
      var chosenItemIndex = -1;
      var chosenItems = Raffler.getLSItem("rafflerChosenItems").items;

      if(chosenItems.length > 0) {
        //console.log("syncCI Raffler.itemsArr", Raffler.itemsArr);
        console.log("syncCI Raffler.itemsArr length", Raffler.itemsArr.length);
        Raffler.itemsArr.forEach(Raffler.logArrayElems);
        $.each(chosenItems, function(chosenItemKey, chosenItemVal) {
          if (chosenItemIndex >= 0) {
            Raffler.itemsArr.splice(chosenItemIndex, 1);
            Raffler.textChosenItems.append(chosenItemVal + "\n");
            Raffler.divResultsContent.append("<li>" + Raffler.lastItemChosen + "</li>");
            Raffler.divResultsWrapper.show();
          }
        });
      }
    }

    Raffler.logArrayElems = function(elem, index, array) {
      console.log("hello");
      console.log('a[' + index + '] = ' + elem);
    }

    Raffler.resetChosenItems = function() {
      setLSItem("rafflerChosenItems", Raffler.initItemsObj);
      updateChosenItemsDisplay();
    }
    Raffler.resetUserItems = function() {
      setLSItem("rafflerUserItems", Raffler.initItemsObj);
      updateUserItemsDisplay();
    }

    // update user items div
    Raffler.updateUserItemsDisplay = function() {
      var lsUserItems = Raffler.getLSItem("rafflerUserItems").items;
      if (lsUserItems) {
        if(lsUserItems.length > 0) {
          Raffler.divUserItems.html("<span class='heading'>user items</span>: ");
          Raffler.divUserItems.append(lsUserItems.join(', '));
        } else {
          Raffler.divUserItems.html("");
        }
      } else {
        Raffler.divUserItems.html("");
      }
    }
    // update chosen items public div and admin textarea
    Raffler.updateChosenItemsDisplay = function() {
      var lsChosenItems = getLSItem("rafflerChosenItems").items;
      if (lsChosenItems) {
        if(lsChosenItems.length > 0) {
          Raffler.textChosenItems.text("");
          for(var item in lsChosenItems) {
            Raffler.textChosenItems.append(item + "\n");
          }
        } else {
          Raffler.textChosenItems.text("");
        }
      } else {
        Raffler.textChosenItems.text("");
      }
    }
    // update LS chosen items
    Raffler.updateChosenItemsLS = function(item) {
      var tempChosenItemsObj = Raffler.getLSItem("rafflerChosenItems");
      tempChosenItemsObj.items.push(Raffler.sanitize(item));
      Raffler.setLSItem("rafflerChosenItems", tempChosenItemsObj);
    }

    // timer object to keep track of countdown
    window.setVariableInterval = function(callbackFunc, timing) {
      var variableInterval = {
        mult: Raffler.initMult,
        stage: 0,
        items: Raffler.itemsArr,
        interval: timing,
        callback: callbackFunc,
        stopped: false,
        startCountdown: false,
        itemsIndex: Math.floor(Math.random() * Raffler.itemsArr.length),
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
            Raffler.divItemsCycle.html("<span>" + variableInterval.items[variableInterval.itemsIndex++] + "</span>");
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
        Raffler.divItemsCycle.removeClass();
        Raffler.divItemsCycle.addClass('level2');
      }

      // slow down more at a certain point
      if (this.interval > 250 &&
          this.interval <= 325) {
        this.stage = 3;
        Raffler.divItemsCycle.removeClass();
        Raffler.divItemsCycle.addClass('level3');
      }

      // stop and pick an item!
      if (this.interval > 325) {
        this.mult = Raffler.initMult;
        if (this.interval > 350) this.mult = this.mult++;
        // adjust for odd time drift
        if (Raffler.timesRun > 0) Raffler.lastInterval = 349;
        if (this.interval >= Raffler.lastInterval) {
          this.stage = 4;
          this.stop();
          this.startCountdown = false;

          Raffler.lastItemChosen = Raffler.divItemsCycle.text();
          Raffler.divItemsCycle.removeClass();
          Raffler.divItemsCycle.addClass('level4');

          Raffler.playSound("victory");

          // add to results div
          Raffler.divResultsContent.append("<li>" + Raffler.lastItemChosen + "</li>");
          Raffler.updateChosenItemsLS(Raffler.lastItemChosen);
          Raffler.divResultsWrapper.show();
          //Raffler.displayFireworks();

          Raffler.timesRun++;
          // add to admin list of chosen items
          Raffler.textChosenItems.append(Raffler.lastItemChosen + "\n");
          // remove last chosen item from Raffler.itemsArr if anything picked
          if (Raffler.lastItemChosen !== "") {
            var i = Raffler.itemsArr.indexOf(Raffler.lastItemChosen);
            if (i != -1) {
              Raffler.itemsArr.splice(i, 1);
            }
          }
          // update admin serverItems
          Raffler.textAvailableItems.text("");
          Raffler.itemsArr.forEach(function(item) {
            Raffler.textAvailableItems.append(item + "\n");
          });

          // re-enable raffle button
          Raffler.enableRaffle();
        } else {
          return interval + this.mult;
        }
      }

      // start countdown!
      if (this.startCountdown &&
          (this.stage == 0 || this.stage == 1)) {
        this.stage = 1;
        if (!Raffler.divItemsCycle.hasClass('level1'))
          Raffler.divItemsCycle.addClass('level1');

        Raffler.playSound("beep");
      }
      // if we've started countdown
      // and we haven't reached end
      // then keep cycling with increased multiplier
      if (this.stage > 0 && this.stage != 4) {
        return interval + (1.5 ^ this.mult++);
      }
    }, Raffler.initInterval);

    // you hit the big raffle button
    Raffler.pickOne = function() {
      //Raffler.hideFireworks();
      // disable button until countdown done
      Raffler.disableRaffle();

      // if we got more than 1 item,
      // then we can raffle
      if (Raffler.itemsArr.length > 1) {
        Raffler.divItemsCycle.removeClass();
        countdownTimer.startCountdown = true;
        countdownTimer.interval = Raffler.initInterval;
        // start new cycle at random spot
        countdownTimer.itemsIndex = Math.floor(Math.random() * Raffler.itemsArr.length);
        countdownTimer.mult = 1;
        countdownTimer.stage = 1;
        countdownTimer.start();
      } else if (Raffler.itemsArr.length == 1) {
        Raffler.divItemsCycle.html("<span>" + Raffler.itemsArr[0] + "</span>");
        Raffler.divResultsContent.append(Raffler.divItemsCycle.text());
        Raffler.notify("Only one item to raffle!<br /><strong>instant winner!</strong>", "warning");
      } else {
        Raffler.divItemsCycle.html("<span>:'(</span>");
        Raffler.notify("Nothing to raffle!<br /><strong>Please advise the admin!</strong>", "failure");
      }
    };

    // you hit the reset button
    // puts everyone back in raffle
    // resets stuff, as if you reloaded page
    Raffler.resetCountdown = function() {
      resetApp();
      resetChosenItems();
      Raffler.divItemsCycle.removeClass();
      Raffler.divResultsContent.text("");
      Raffler.textAvailableItems.text("");
      Raffler.divResultsWrapper.hide();
      countdownTimer.startCountdown = false;
      countdownTimer.interval = Raffler.initInterval;
      countdownTimer.mult = Raffler.initMult;
      countdownTimer.stage = 0;
      countdownTimer.start();
    }

    Raffler.disableRaffle = function() {
      Raffler.btnRaffle.addClass("disabled");
      Raffler.btnRaffle.prop("disabled", true);
    }
    Raffler.enableRaffle = function() {
      Raffler.btnRaffle.removeClass("disabled");
      Raffler.btnRaffle.prop("disabled", false);
    }

    // encode user entries html
    Raffler.sanitize = function(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/""/g, '&quot;');
    }
    // check for duplicate user entries
    Raffler.isDuplicateValue = function(newUserItem) {
      $curPicks = getLSItem("rafflerUserItems");
      var dupeFound = false;

      $.each($curPicks.items, function(key, val) {
        if (newUserItem == val) {
          dupeFound = true;
          return false;
        }
      });

      return dupeFound;
    }
    // get querystring
    Raffler.getUrlVars = function() {
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
    // localStorage getter/setter
    Raffler.getLSItem = function(lsKey) {
      return JSON.parse(localStorage.getItem(lsKey));
    }
    Raffler.setLSItem = function(lsKey, obj) {
      localStorage.setItem(lsKey, JSON.stringify(obj));
    }
    // app notifications
    Raffler.notify = function(msg, type = "") {
      var bgColor = "#fff";
      var color = "#000";
      var speed = 3000;
      switch (type) {
        case "success":
          bgColor = "#847E04";
          speed = 1500;
          break;
        case "warning":
          bgColor = "";
          speed = 3000;
          break;
        case "failure":
          bgColor = "#880000";
          speed = 5000;
          break;
        default:
          break;
      }
      Raffler.divItemStatusBubble.css({
        "background-color": bgColor,
        "color": color
      }).statusShow("<span>Raffler: " + msg + "</span>", speed);
      console.log("Raffler: " + msg);
    }
    Raffler.playSound = function(soundId) {
      if (Raffler.ckOptSound.is(":checked"))
        document.getElementById(soundId).play();
    }

    Raffler.initApp();
  });

});
