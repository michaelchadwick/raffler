/* main */
/* app entry point and main functions */

$(function() {
  // app entry point
  Raffler.initApp = function() {
    // if admin passed, show hamburger menu
    if (typeof $.QueryString['admin'] !== "undefined") {
      Raffler.btnAdminMenuToggle.show();
    }

    Raffler.setEventHandlers();
    Raffler.resetApp();
    Raffler.checkForLocalStorage();
    Raffler.btnRaffle.focus();

    Raffler._notify("Raffler init", "notice");
  }

  Raffler.setEventHandlers = function() {
    Raffler.btnAdminMenuToggle.on('click', function() {
      $(this).toggleClass('button-open');
      Raffler.divAdminMenu.toggleClass('menu-show');
    });
    Raffler.btnRaffle.click(function(e) {
      e.preventDefault();
      if (!Raffler.btnRaffle.prop("disabled")) {
        Raffler.pickOne();
      }
    });
    Raffler.btnTimerStart.click(function(e) {
      e.preventDefault();
      if (btnTimerStart.prop("disabled", false))
        countdownTimer.start();
    });
    Raffler.btnTimerStop.click(function(e) {
      e.preventDefault();
      if (btnTimerStop.prop("disabled", false))
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
            Raffler.resetCountdown();
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
        var newUserItem = Raffler.inputUserItemsAdd.val().trim();

        if (newUserItem !== "") {
          var tempUserItemObj = Raffler._getLocalStorageItem("rafflerUserItems");
          var newPickAdded = false;

          // if someone adds a list of things, turn into array and then push
          if (newUserItem.indexOf(',') > -1) {
            $.each(newUserItem.split(','), function(key, val) {
              if (!Raffler._isDuplicateValue(val)) {
                tempUserItemObj.items.push(Raffler._sanitize(val));
                newPickAdded = true;
                Raffler.btnUserItemsClear.prop("disabled", false);
                Raffler.btnUserItemsClear.removeClass();
              } else {
                Raffler._notify("user item " + val + " not added: duplicate.", "failure", true);
              }
            });
          } else {
            // else push single new item onto temp tempUserItemObj
            if (!Raffler._isDuplicateValue(newUserItem)) {
              tempUserItemObj.items.push(Raffler._sanitize(newUserItem));
              newPickAdded = true;
              Raffler.btnUserItemsClear.prop("disabled", false);
              Raffler.btnUserItemsClear.removeClass();
            } else {
              Raffler._notify("user item " + newUserItem + " not added: duplicate.", "failure", true);
            }
          }

          if (newPickAdded) {
            // update localStorage with temp tempUserItemObj
            Raffler._setLocalStorageItem("rafflerUserItems", tempUserItemObj);
            // show status bubble
            Raffler._notify("user item " + newUserItem + " added!", "success", true);
            Raffler.syncUserItemsToItemsArr();
            Raffler.updateUserItemsDisplay();
          }
        }
      }
    });
    Raffler.btnUserItemsClear.click(function(e) {
      e.preventDefault();
      try {
        if (Raffler._getLocalStorageItem("rafflerUserItems").items.length > 0) {
          Raffler.btnUserItemsClear.prop("disabled", false);
          Raffler.btnUserItemsClear.removeClass();

          Raffler.divUserItemsClearDialog.dialog({
            autoOpen: false,
            modal: true,
            resizeable: false,
            height: "auto",
            buttons: {
              "Clear them!" : function() {
                Raffler.resetUserItems();

                Raffler.inputUserItemsAdd.val("");

                Raffler.btnUserItemsClear.prop("disabled", true);
                Raffler.btnUserItemsClear.addClass("disabled");

                Raffler._notify("User items cleared", "success", true);

                $(this).dialog("close");
              },
              "Nevermind." : function() {
                $(this).dialog("close");
              }
            }
          });

          Raffler.divUserItemsClearDialog.dialog("open");
        }
      } catch (e) {
        Raffler._notify("btnUserItemsClear: " + e);
      }
    });
  }
  Raffler.resetApp = function() {
    Raffler.initItemsArr();
    Raffler.resetUserItems();
    Raffler.lastItemChosen = "";
    Raffler._notify("Raffler reset");
  }
  Raffler.checkForLocalStorage = function() {
    // if we got LS or SS, then set up the user items UI
    try {
      var LSsupport = !(typeof window.localStorage == 'undefined');
      var SSsupport = !(typeof window.sessionStorage == 'undefined');
      if (!LSsupport && !SSsupport) {
        Raffler.hasLocalStorage = false;
        Raffler.divUserItemsManager.hide();
        Raffler._notify("No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don't reload!", "failure", true);
      } else {
        // if our specific keys don't exist, then init
        if (!localStorage.getItem("rafflerUserItems")) {
          Raffler._setLocalStorageItem("rafflerUserItems", Raffler.initItemsObj);
          Raffler._notify("checkForLocalStorage: rafflerUserItems created");
        } else {
          Raffler._notify("checkForLocalStorage: rafflerUserItems already exists");
        }
        if (!localStorage.getItem("rafflerChosenItems")) {
          Raffler._setLocalStorageItem("rafflerChosenItems", Raffler.initItemsObj);
          Raffler._notify("checkForLocalStorage: rafflerUserItems created");
        } else {
          Raffler._notify("checkForLocalStorage: rafflerChosenItems already exists");
        }
      }
    } catch (e) {
      Raffler.hasLocalStorage = false;
      Raffler.divUserItemsManager.hide();
      Raffler._notify("No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don't reload!", "failure", true);
    }
  }

  // init/reset Raffler.itemsArr with server json
  Raffler.initItemsArr = function() {
    $.getJSON("json/raffler_items_initial.json", function(data) {
      Raffler.itemsArr.clear(); // clear global Raffler.itemsArr
      Raffler.itemsArr.length = 0;

      $.each(data.items_initial, function(key, val) {
        Raffler.itemsArr[Raffler.itemsArr.length] = val;
        Raffler.textAvailableItems.prepend(val + "\n");
      });

      Raffler.syncChosenItemsToItemsArr();
      Raffler.syncUserItemsToItemsArr();
    });
  };
  
  // remove chosen items from main items array
  Raffler.syncChosenItemsToItemsArr = function() {
    var chosenItemIndex = 0;
    try {
      var chosenItems = Raffler._getLocalStorageItem("rafflerChosenItems").items;

      if(chosenItems.length > 0) {
        $.each(chosenItems, function(chosenItemKey, chosenItemVal) {
          if (chosenItemIndex >= 0) {
            Raffler.itemsArr.splice(Raffler.itemsArr.indexOf(chosenItemVal), 1);
            Raffler.textAvailableItems.text(Raffler.textAvailableItems.text().replace(chosenItemVal + "\n", ""));
            Raffler.textChosenItems.prepend(chosenItemVal + "\n");
            Raffler.divResultsContent.prepend("<li>" + chosenItemVal + "</li>");
            Raffler.divResultsWrapper.show();
          }
          chosenItemIndex++;

          Raffler._notify("syncChosenItemsToItemsArr: synced chosen items");
        });
      } else {
        Raffler._notify("syncChosenItemsToItemsArr: no chosen items to sync");
      }
    } catch (e) {
      Raffler._notify("syncChosenItemsToItemsArr: ", e);
    }
  }
  // add user items to main items array
  Raffler.syncUserItemsToItemsArr = function() {
    try {
      var userItems = Raffler._getLocalStorageItem("rafflerUserItems");
      Raffler.inputUserItemsAdd.text("");
      if(userItems.items && userItems.items.length > 0) {
        Raffler.btnUserItemsClear.prop("disabled", false);
        Raffler.btnUserItemsClear.removeClass();
        $.each(userItems.items, function(key, val) {
          if (Raffler.itemsArr.indexOf(val) < 0) {
            Raffler.itemsArr.push(val);
          }
        });
        Raffler.updateUserItemsDisplay();

        Raffler._notify("syncUserItemsToItemsArr: synced user items");
      } else {
        Raffler._notify("syncUserItemsToItemsArr: no user items to sync");
      }
      Raffler.updateAdminItemsAvailable();
    } catch (e) {
      Raffler._notify("syncUserItemsToItemsArr: " + e);
    }
  }

  Raffler.resetChosenItems = function() {
    try {
      Raffler._setLocalStorageItem("rafflerChosenItems", Raffler.initItemsObj);
      Raffler.updateChosenItemsDisplay();

      Raffler._notify("resetChosenItems: chosen items reset");
    } catch (e) {
      Raffler._notify("resetChosenItems: " + e);
    }
  }
  Raffler.resetUserItems = function() {
    try {
      Raffler._setLocalStorageItem("rafflerUserItems", Raffler.initItemsObj);
      Raffler.initItemsArr();
      Raffler.updateUserItemsDisplay();

      Raffler._notify("resetUserItems: user items reset");
    } catch (e) {
      Raffler._notify("resetUserItems: " + e);
    }
  }
  
  Raffler.updateChosenItemsDisplay = function() {
    try {
      var lsChosenItems = Raffler._getLocalStorageItem("rafflerChosenItems");
      if (lsChosenItems && lsChosenItems.length > 0) {
        Raffler.textChosenItems.text("");
        for(var item in lsChosenItems) {
          Raffler.textChosenItems.prepend(item + "\n");
        }

        Raffler._notify("updateChosenItemsDisplay: chosen items display updated");
      } else {
        Raffler._notify("updateChosenItemsDisplay: no chosen items to display");
        Raffler.textChosenItems.text("");
      }
    } catch (e) {
      Raffler._notify("updateChosenItemsDisplay: " + e);
    }
  }
  Raffler.updateUserItemsDisplay = function() {
    try {
      var lsUserItems = Raffler._getLocalStorageItem("rafflerUserItems").items;
      if (lsUserItems && lsUserItems.length > 0) {
        Raffler.divUserItemsDisplay.html("<span class='heading'>user items</span>: ");
        Raffler.divUserItemsDisplay.append(lsUserItems.join(', '));

        Raffler._notify("updateUserItemsDisplay: user items display updated");
      } else {
        Raffler._notify("updateUserItemsDisplay: no user items to display");
        Raffler.divUserItemsDisplay.html("");
      }
    } catch (e) {
      Raffler._notify("updateUserItemsDisplay: " + e);
    }
  }
  
  Raffler.updateChosenItemsLocalStorage = function(item) {
    try {
      var tempChosenItemsObj = Raffler._getLocalStorageItem("rafflerChosenItems");
      tempChosenItemsObj.items.push(Raffler._sanitize(item));
      Raffler._setLocalStorageItem("rafflerChosenItems", tempChosenItemsObj);
    } catch (e) {
      Raffler._notify("updateChosenItemsLocalStorage: " + e);
    }
  }
  Raffler.updateAdminItemsAvailable = function() {
    Raffler.textAvailableItems.text("");
    Raffler.itemsArr.forEach(function(item) {
      Raffler.textAvailableItems.prepend(item + "\n");
    });

    Raffler._notify("updateAdminItemsAvailable: admin items available display updated");
  }
  
  // timer object to keep track of countdown
  Raffler.setVariableInterval = function(callbackFunc, timing) {
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
  var countdownTimer = Raffler.setVariableInterval(function() {
    // this is the variableInterval - so we can change/get the interval here:
    var interval = this.interval;

    // slow down at a certain point
    if (this.interval > 150 &&
        this.interval <= 250) {
      this.stage = 2;

      if (Raffler.ckOptResize.is(":checked")) {
        Raffler.divItemsCycle.removeClass();
        Raffler.divItemsCycle.addClass('level2');
        Raffler.body.removeClass();
        Raffler.body.addClass('level2');
      }
    }

    // slow down more at a certain point
    if (this.interval > 250 &&
        this.interval <= 325) {
      this.stage = 3;

      if (Raffler.ckOptResize.is(":checked")) {
        Raffler.divItemsCycle.removeClass();
        Raffler.divItemsCycle.addClass('level3');
        Raffler.body.removeClass();
        Raffler.body.addClass('level3');
      }
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

        if (Raffler.ckOptResize.is(":checked")) {
          Raffler.divItemsCycle.removeClass();
          Raffler.divItemsCycle.addClass('level4');
          Raffler.body.removeClass();
          Raffler.body.addClass('level4');
        }

        Raffler._playSound("victory");

        // add to results div
        Raffler.divResultsContent.prepend("<li>" + Raffler.lastItemChosen + "</li>");
        Raffler.updateChosenItemsLocalStorage(Raffler.lastItemChosen);
        Raffler.divResultsWrapper.show();
        Raffler.displayFireworks();

        Raffler.timesRun++;
        // add to admin list of chosen items
        Raffler.textChosenItems.prepend(Raffler.lastItemChosen + "\n");
        // remove last chosen item from Raffler.itemsArr if anything picked
        if (Raffler.lastItemChosen !== "") {
          var i = Raffler.itemsArr.indexOf(Raffler.lastItemChosen);
          if (i != -1) {
            Raffler.itemsArr.splice(i, 1);
          }
        }
        Raffler.updateAdminItemsAvailable();
        Raffler._notify("Raffled successfully!", "success");

        Raffler._enableRaffle();
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

      Raffler._playSound("beep");
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
    Raffler.hideFireworks();
    // disable button until countdown done
    Raffler._disableRaffle();

    if (Raffler.ckOptResize.is(":checked")) {
      Raffler.divItemsCycle.removeClass();
    } else {
      Raffler.body.addClass("level4");
    }

    // if we got more than 1 item,
    // then we can raffle
    if (Raffler.itemsArr.length > 1) {
      countdownTimer.startCountdown = true;
      countdownTimer.interval = Raffler.initInterval;
      // start new cycle at random spot
      countdownTimer.itemsIndex = Math.floor(Math.random() * Raffler.itemsArr.length);
      countdownTimer.mult = 1;
      countdownTimer.stage = 1;
      countdownTimer.start();
    } else if (Raffler.itemsArr.length == 1) {
      Raffler.divItemsCycle.html("<span>" + Raffler.itemsArr[0] + "</span>");
      Raffler.divResultsContent.prepend(Raffler.divItemsCycle.text());
      Raffler._notify("Only one item to raffle!<br /><strong>instant winner!</strong>", "warning", true);
    } else {
      Raffler.divItemsCycle.html("<span>:'(</span>");
      Raffler._notify("Nothing to raffle!<br /><strong>Please advise the admin!</strong>", "failure", true);
    }
  };

  // you hit the reset button
  // puts everyone back in raffle
  // resets stuff, as if you reloaded page
  Raffler.resetCountdown = function() {
    Raffler.resetApp();
    Raffler.resetChosenItems();
    Raffler.resetUserItems();
    if (Raffler.ckOptResize.is(":checked")) {
      Raffler.divItemsCycle.removeClass();
    }
    Raffler.divResultsContent.text("");
    Raffler.inputUserItemsAdd.val("");
    Raffler.textAvailableItems.text("");
    Raffler.textChosenItems.text("");
    Raffler.divResultsWrapper.hide();
    countdownTimer.startCountdown = false;
    countdownTimer.interval = Raffler.initInterval;
    countdownTimer.mult = Raffler.initMult;
    countdownTimer.stage = 0;
    countdownTimer.start();
  }

  Raffler.initApp();
});
