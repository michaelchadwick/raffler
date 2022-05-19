/* init */
/* get the main app object set up */
/* also define a couple extensions */
/* global $, talkify */

const ENV_PROD_URL = ['https://neb.host/raffler', 'https://raffler.neb.host', 'https://raffler.me']
const RAFFLER_OPTIONS_FILE = './config/raffler_options.json'
const USER_OPTIONS_FILE = './config/raffler_options.user.json'

const RAFFLER_SETTINGS_KEY = 'raffler-settings'
const RAFFLER_USER_ITEMS_KEY = 'raffler-user-items'
const RAFFLER_CHOSEN_ITEMS_KEY = 'raffler-chosen-items'

// Raffler object init
if ((typeof Raffler) === 'undefined') var Raffler = {}

// Raffler properties
Raffler.itemsArr = []
Raffler.itemsLeftArr = []
Raffler.initItemsObj = []
Raffler.initInterval = 25
Raffler.initMult = 1
Raffler.initTimesRun = 0
Raffler.lastInterval = 361
Raffler.hasLocalStorage = true
Raffler.lastItemChosen = ''
Raffler.lastItemChosenConfirmed = false
Raffler.stages = {
  INIT: 0,
  BEGUN: 1,
  SLOWED: 2,
  SLOWEST: 3,
  DONE: 4
}

// Raffler sub-property groups
Raffler.options = {}

// load options
$.ajax({
  dataType: 'json', url: RAFFLER_OPTIONS_FILE, async: false,
  success: function(data) {
    Raffler.defaults = data
    $.extend(Raffler.options, data)
  }
})

// load user options
$.ajax({
  dataType: 'json', url: USER_OPTIONS_FILE, async: false,
  success: function(data) {
    Raffler.options = $.extend({}, Raffler.options, data)
  }
})
