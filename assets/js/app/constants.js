/* constants */
/* set any global constants */

const RAFFLER_ENV_PROD_URL = [
  'https://neb.host/raffler',
  'https://raffler.neb.host',
  'https://raffler.me'
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
