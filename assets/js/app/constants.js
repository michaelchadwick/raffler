/* constants */
/* set any global app constants */
/* global Raffler */
/* eslint-disable no-unused-vars */

const RAFFLER_ENV_PROD_URL = [
  'neb.host',
  'neb.host/raffler',
  'raffler.neb.host',
  'raffler.me'
]

const NEBYOOAPPS_SOURCE_URL = 'https://dave.neb.host/?sites'

const RAFFLER_SETTINGS_KEY = 'raffler-settings'

const RAFFLER_USER_SETTINGS_FILE = '/config/raffler_config.user.json'

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
  'config': {
    'allowNotifications': true,
    'dataFilePath': '/config/raffler_data.json',
    'hasLocalStorage': true,
    'intervalRange': RAFFLER_DEFAULT_INTERVAL,
    'itemsArr': [],
    'itemsAvailable': [],
    'itemsLeftArr': [],
    'lastItemChosen': null,
    'lastItemChosenConfirmed': false,
    'lastInterval': 361,
    'multiply': RAFFLER_DEFAULT_MULTIPLY,
    'stage': 0,
    'talkifyKey': '',
    'textAvailableItems': [],
    'textChosenItems': [],
    'timesRun': 0
  },
  'settings': {
    'boxResize': true,
    'logoFileLink': '',
    'logoFilePath': '',
    'notifierEnabled': false,
    'showDebug': false,
    'showGraph': false,
    'soundCountdown': false,
    'soundVictory': false,
    'soundName': false
  }
}

// settings: saved in LOCAL STORAGE
Raffler.settings = RAFFLER_DEFAULTS.settings

// config: only saved while game is loaded
Raffler.config = RAFFLER_DEFAULTS.config
