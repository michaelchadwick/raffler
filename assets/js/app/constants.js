/* constants */
/* set any global constants */

const ENV_PROD_URL = [
  'https://neb.host/raffler',
  'https://raffler.neb.host',
  'https://raffler.me'
]

const LS_SETTINGS_KEY = 'raffler-settings'

const RAFFLER_USER_SETTINGS_FILE = './raffler_settings.user.json'

const RAFFLER_USER_ITEMS_KEY = 'raffler-user-items'
const RAFFLER_CHOSEN_ITEMS_KEY = 'raffler-chosen-items'

const RAFFLER_SETTINGS_INTERVAL_DEFAULT = 25
const RAFFLER_SETTINGS_MULTIPLY_DEFAULT = 1

const RAFFLER_STAGES = {
  INIT: 0,
  BEGUN: 1,
  SLOWED: 2,
  SLOWEST: 3,
  DONE: 4
}
