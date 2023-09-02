/* constants */
/* set any global app constants */
/* global Raffler */
/* eslint-disable no-unused-vars */

const RAFFLER_ENV_PROD_URL = [
  'neb.host',
  'neb.host/raffler',
  'raffler.neb.host',
  'raffler.me',
  'raffler.fun'
]

const NEBYOOAPPS_SOURCE_URL = 'https://dave.neb.host/?sites'

const RAFFLER_SETTINGS_KEY = 'raffler-settings'
const RAFFLER_ITEMS_AVAIL_KEY = 'raffler-items-avail'
const RAFFLER_ITEMS_CHOSEN_KEY = 'raffler-items-chosen'

const RAFFLER_LOCAL_CONFIG_FILE = '/config/raffler_config.json'

const RAFFLER_DEFAULT_INTERVAL_RANGE = 25
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
    'configFilePath': RAFFLER_LOCAL_CONFIG_FILE,
    'dataFilePath': '',
    'env': 'prod',
    'intervalRange': RAFFLER_DEFAULT_INTERVAL_RANGE,
    'itemsArr': [],
    'logoFileLink': '',
    'logoFilePath': '',
    'lastItemChosen': null,
    'lastItemChosenConfirmed': false,
    'lastInterval': 361,
    'multiplyValue': RAFFLER_DEFAULT_MULTIPLY,
    'stage': 0,
    'talkifyKey': '',
    'timesRun': 0
  },
  'settings': {
    'allowBoxResize': true,
    'allowDebugNotifications': true,
    'allowVisualNotifications': true,
    'showDebug': false,
    'showGraph': false,
    'showSettings': false,
    'sound': {
      'countdown': false,
      'name': false,
      'victory': false,
    }
  }
}

// settings: saved in LOCAL STORAGE
Raffler.settings = {...RAFFLER_DEFAULTS.settings}

// config: only saved while game is loaded
Raffler.config = {...RAFFLER_DEFAULTS.config}
