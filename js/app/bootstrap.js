/* bootstrap */
/* get the main app object set up */
/* also define a couple extensions */

var Raffler = {};

// global variables
Raffler.itemsArr =                [];
Raffler.initItemsObj =            { "items": [] }
Raffler.initInterval =            25;
Raffler.initMult =                1;
Raffler.lastItemChosen =          "";
Raffler.timesRun =                0;
Raffler.lastInterval =            359;
Raffler.hasLocalStorage =         true;

// main divs/elements
Raffler.body =                    $('body');
Raffler.divAdminMenu =            $('div#admin-menu');
Raffler.divMainWrapper =          $('div#wrapper');
Raffler.divItemsCycle =           $('div#items-cycle');
Raffler.divResultsWrapper =       $('div#results-wrapper');
Raffler.divResultsContent =       $('div#results-wrapper div ul');
Raffler.divUserItemsManager =     $('div#user-items-manager');
Raffler.divUserItemsDisplay =     $('div#user-items-display');
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

// Array extension to make it easier to clear arrays
Array.prototype.clear = function() {
  while (this.length) { this.pop(); }
};

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
