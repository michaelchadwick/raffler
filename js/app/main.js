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
    Raffler.checkForLocalStorage();
    Raffler.resetApp();

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
      if (Raffler.btnTimerStart.prop("disabled", false))
        countdownTimer.start();
    });
    Raffler.btnTimerStop.click(function(e) {
      e.preventDefault();
      if (Raffler.btnTimerStop.prop("disabled", false))
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
                tempUserItemObj.push(Raffler._sanitize(val));
                newPickAdded = true;
                Raffler.btnUserItemsClear.prop("disabled", false);
                Raffler.btnUserItemsClear.removeClass();
              } else {
                Raffler._notify("user item " + val + " not added: duplicate.", "error", true);
              }
            });
          } else {
            // else push single new item onto temp tempUserItemObj
            if (!Raffler._isDuplicateValue(newUserItem)) {
              tempUserItemObj.push(Raffler._sanitize(newUserItem));
              newPickAdded = true;
              Raffler.btnUserItemsClear.prop("disabled", false);
              Raffler.btnUserItemsClear.removeClass();
            } else {
              Raffler._notify("user item " + newUserItem + " not added: duplicate.", "error", true);
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
        if (Raffler._getLocalStorageItem("rafflerUserItems").length > 0) {
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
        Raffler._notify("btnUserItemsClear: " + e, "error");
      }
    });
  }
  Raffler.checkForLocalStorage = function() {
    // if we got LS or SS, then set up the user items UI
    try {
      var LSsupport = !(typeof window.localStorage == 'undefined');
      var SSsupport = !(typeof window.sessionStorage == 'undefined');
      if (!LSsupport && !SSsupport) {
        Raffler.hasLocalStorage = false;
        Raffler.divUserItemsManager.hide();
        Raffler._notify("No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don't reload!", "error", true);
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
      Raffler._notify("No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don't reload!", "error", true);
    }
  }

  Raffler.resetApp = function() {
    Raffler.initItemsArr();
    Raffler.resetUserItems();
    Raffler.lastItemChosen = "";
    Raffler.updateResultsCount();
    Raffler._notify("Raffler reset");
  }

  // init/reset Raffler.itemsArr with server json
  Raffler.initItemsArr = function() {
    var key0, key1, val0, val1;
    var jqxhr = $.getJSON(Raffler.dataFilePath, function(data) {
      })
      .done(function(data) {
        Raffler.itemsArr.clear();
        Raffler.itemsArr.length = 0;

        $.each(data, function(key, val) {
          key0 = Object.keys(val)[0];
          key1 = Object.keys(val)[1];

          val0 = val[key0];
          val1 = val[key1];

          Raffler.itemsArr.push(val);
          Raffler.textAvailableItems.prepend(val0 + " (" + val1 + ")\n");
        });

        Raffler.syncChosenItemsToItemsArr();
        Raffler.syncUserItemsToItemsArr();
        Raffler.updateChosenItemsDisplay();
      })
      .fail(function(jqxhr, textStatus, error) {
        console.error("initial json failed: ", error);
      });
  };

  // remove chosen items from main items array
  Raffler.syncChosenItemsToItemsArr = function() {
    var chosenItemIndex = 0;
    try {
      var chosenItems = Raffler._getLocalStorageItem("rafflerChosenItems");

      if(chosenItems.length > 0) {
        Raffler.divResultsContent.text("");
        $.each(chosenItems, function(chosenItemKey, chosenItemVal) {
          if (chosenItemIndex >= 0) {
            Raffler.itemsArr.splice(Raffler.itemsArr.indexOf(chosenItemVal), 1);
            Raffler.textAvailableItems.text(Raffler.textAvailableItems.text().replace(chosenItemVal + "\n", ""));
            Raffler.textChosenItems.prepend(chosenItemVal + "\n");
            Raffler.divResultsContent.prepend("<li>" + chosenItemVal.name + " (" + chosenItemVal.affl + ")</li>");
            Raffler.divResultsWrapper.show();
          }
          chosenItemIndex++;

          Raffler._notify("syncChosenItemsToItemsArr: synced chosen items");
        });
      } else {
        Raffler._notify("syncChosenItemsToItemsArr: no chosen items to sync");
      }
    } catch (e) {
      Raffler._notify("syncChosenItemsToItemsArr: " + e, "error");
    }
  }
  // add user items to main items array
  Raffler.syncUserItemsToItemsArr = function() {
    try {
      var userItems = Raffler._getLocalStorageItem("rafflerUserItems");
      Raffler.inputUserItemsAdd.text("");
      if(userItems && userItems.length > 0) {
        Raffler.btnUserItemsClear.prop("disabled", false);
        Raffler.btnUserItemsClear.removeClass();
        $.each(userItems, function(key, val) {
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
      Raffler._notify("syncUserItemsToItemsArr: " + e, "error");
    }
  }
  // reset chosen items localStorage to nothing and update displays
  Raffler.resetChosenItems = function() {
    try {
      Raffler._setLocalStorageItem("rafflerChosenItems", Raffler.initItemsObj);
      Raffler.updateChosenItemsDisplay();

      Raffler._notify("resetChosenItems: chosen items reset");
    } catch (e) {
      Raffler._notify("resetChosenItems: " + e, "error");
    }
  }
  // reset user items localStorage to nothing and update displays
  Raffler.resetUserItems = function(firstRun = false) {
    try {
      Raffler._setLocalStorageItem("rafflerUserItems", Raffler.initItemsObj);
      Raffler.updateUserItemsDisplay();

      Raffler._notify("resetUserItems: user items reset");
    } catch (e) {
      Raffler._notify("resetUserItems: " + e, "error");
    }
  }
  // reset number of results to the length of localStorage
  Raffler.updateResultsCount = function() {
    Raffler.divResultsCount.text(Raffler._getLocalStorageItem('rafflerChosenItems').length);
  }

  // set admin chosen items to localStorage values
  Raffler.updateChosenItemsDisplay = function() {
    try {
      var lsChosenItems = Raffler._getLocalStorageItem("rafflerChosenItems");
      if (lsChosenItems && lsChosenItems.length > 0) {
        Raffler.textChosenItems.text("");

        $.each(lsChosenItems, function(key, val) {
          Raffler.textChosenItems.prepend(val.name + " (" + val.affl + ")\n");
        });

        Raffler._notify("updateChosenItemsDisplay: chosen items display updated");
      } else {
        Raffler.textChosenItems.text("");
        Raffler._notify("updateChosenItemsDisplay: no chosen items to display");
      }
    } catch (e) {
      Raffler._notify("updateChosenItemsDisplay: " + e, "error");
    }
  }
  // set admin user items to localStorage values
  Raffler.updateUserItemsDisplay = function() {
    try {
      var lsUserItems = Raffler._getLocalStorageItem("rafflerUserItems");
      if (lsUserItems && lsUserItems.length > 0) {
        Raffler.divUserItemsDisplay.html("<span class='heading'>user items</span>: ");
        Raffler.divUserItemsDisplay.append(lsUserItems.join(', '));

        Raffler._notify("updateUserItemsDisplay: user items display updated");
      } else {
        Raffler.divUserItemsDisplay.html("");
        Raffler._notify("updateUserItemsDisplay: no user items to display");
      }
    } catch (e) {
      Raffler._notify("updateUserItemsDisplay: " + e, "error");
    }
  }
  // add last chosen item to localStorage
  Raffler.updateChosenItemsLocalStorage = function(item) {
    try {
      var tempChosenItemsObj = Raffler._getLocalStorageItem("rafflerChosenItems");
      tempChosenItemsObj.push(item);
      Raffler._setLocalStorageItem("rafflerChosenItems", tempChosenItemsObj);
    } catch (e) {
      Raffler._notify("updateChosenItemsLocalStorage: " + e, "error");
    }
  }
  // re-display admin items available from main itemsArr array
  Raffler.updateAdminItemsAvailable = function() {
    Raffler.textAvailableItems.text("");
    Raffler.itemsArr.forEach(function(item) {
      Raffler.textAvailableItems.prepend(item.name + " (" + item.affl + ")\n");
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
        if (variableInterval.stage != 4) {
          var name = variableInterval.items[variableInterval.itemsIndex].name;
          var affl = variableInterval.items[variableInterval.itemsIndex].affl;
          var chosenItemHTML = "";
          chosenItemHTML += "<div class='itemName'>" + name + "</div>\n";
          chosenItemHTML += "<div class='itemAffl'>" + affl + "</div>";

          Raffler.divItemsCycle.html(chosenItemHTML);
          variableInterval.itemsIndex++;
        }
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

    // finally, stop and pick an item!
    if (this.interval > 325) {
      this.mult = Raffler.initMult;
      if (this.interval > 350) this.mult = this.mult++;
      // adjust for odd time drift
      if (Raffler.timesRun > 0) Raffler.lastInterval = 349;
      if (this.interval >= Raffler.lastInterval) {
        this.stage = 4;
        this.stop();
        this.startCountdown = false;

        Raffler.lastItemChosen = {
          'name': $('div.itemName').text(),
          'affl': $('div.itemAffl').text()
        };

        if (Raffler.ckOptResize.is(":checked")) {
          Raffler.divItemsCycle.removeClass();
          Raffler.divItemsCycle.addClass('level4');
          Raffler.body.removeClass();
          Raffler.body.addClass('level4');
        }

        Raffler._playSound("victory");

        // add to results div
        //// prepend to bottom public list
        Raffler.divResultsContent.prepend(
          "<li>" + Raffler.lastItemChosen.name + " (" + Raffler.lastItemChosen.affl + ")</li>"
        );

        //// sync chosen item to localStorage
        Raffler.updateChosenItemsLocalStorage(Raffler.lastItemChosen);
        //// increase count
        Raffler.updateResultsCount();
        //// show results wrapper
        Raffler.divResultsWrapper.show();
        //// display fireworks
        Raffler.displayFireworks();

        Raffler.timesRun++;

        // remove last chosen item from Raffler.itemsArr if anything picked
        if (Raffler.lastItemChosen != "") {
          // add to admin list of chosen items
          Raffler.textChosenItems.prepend(Raffler.lastItemChosen.name + " (" + Raffler.lastItemChosen.affl + ")\n");

          let item = Raffler.lastItemChosen;
          let items = Raffler.itemsArr;

          for (var i=0; i<items.length; i++) {
            if(items[i].name == item.name && items[i].affl == item.affl) {
              items.splice(i, 1);
            }
          }
        }
        Raffler.updateAdminItemsAvailable();
        Raffler._notify("Raffled successfully! " + Raffler.lastItemChosen.name + " chosen!", "success");

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
      countdownTimer.stop();
      Raffler.divItemsCycle.html("<div class='itemName'>" + Raffler.itemsArr[0].name + "</div> <div class='itemAffl'>" + Raffler.itemsArr[0].affl + "</div>");

      Raffler.lastItemChosen = {
        'name': $('div.itemName').text(),
        'affl': $('div.itemAffl').text()
      };
      Raffler._playSound("victory");

      // add to results div
      //// prepend to bottom public list
      Raffler.divResultsContent.prepend(
        "<li>" + Raffler.lastItemChosen.name + " (" + Raffler.lastItemChosen.affl + ")</li>"
      );
      //// sync chosen item to localStorage
      Raffler.updateChosenItemsLocalStorage(Raffler.lastItemChosen);
      //// increase count
      Raffler.updateResultsCount();

      Raffler.timesRun++;
      Raffler._notify("Only one item to raffle!<br /><strong>instant winner!</strong>", "warning", true);
    } else {
      Raffler.divItemsCycle.html("<div>:'(</div>");
      Raffler._notify("Nothing to raffle!<br /><strong>Please advise the admin!</strong>", "error", true);
    }
  };

  // you hit the 'reset data' button
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
    Raffler.raffleCount = 0;
    Raffler.inputUserItemsAdd.val("");
    Raffler.textAvailableItems.text("");
    Raffler.textChosenItems.text("");
    Raffler.divResultsWrapper.hide();
    Raffler._enableRaffle();
    countdownTimer.startCountdown = false;
    countdownTimer.interval = Raffler.initInterval;
    countdownTimer.mult = Raffler.initMult;
    countdownTimer.stage = 0;
    countdownTimer.start();
  }

  Raffler.initApp();
});
