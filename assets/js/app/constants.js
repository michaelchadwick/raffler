/* constants */
/* set any global constants */

const RAFFLER_ENV_PROD_URL = [
  'neb.host/raffler',
  'raffler.neb.host',
  'raffler.me'
]

const RAFFLER_SETTINGS_KEY = 'raffler-settings'

const RAFFLER_USER_SETTINGS_FILE = './raffler_settings.user.json'

const RAFFLER_USER_ITEMS_KEY = 'raffler-user-items'
const RAFFLER_CHOSEN_ITEMS_KEY = 'raffler-chosen-items'

const RAFFLER_DEFAULT_INTERVAL = 25
const RAFFLER_DEFAULT_MULTIPLY = 1

const RAFFLER_STAGES = {
  INIT: 0,
  BEGUN: 1,
  SLOWED: 2,
  SLOWEST: 3,
  DONE: 4
}

const RAFFLER_DEFAULTS = {
  "config": {
    "allowNotifications": true,
    "hasLocalStorage": true,
    "intervalRange": RAFFLER_DEFAULT_INTERVAL,
    "itemsArr": [],
    "itemsAvailable": [],
    "itemsLeftArr": [],
    "lastItemChosen": null,
    "lastItemChosenConfirmed": false,
    "lastInterval": 361,
    "multiply": RAFFLER_DEFAULT_MULTIPLY,
    "stage": 0,
    "talkifyKey": '',
    "textAvailableItems": [],
    "textChosenItems": [],
    "timesRun": 0
  },
  "settings": {
    "boxResize": true,
    "dataFilePath": './assets/json/raffler_data.json',
    "logoFileLink": '',
    "logoFilePath": '',
    "notifierEnabled": false,
    "showDebug": false,
    "showGraph": false,
    "soundCountdown": false,
    "soundVictory": false,
    "soundName": false
  }
}
