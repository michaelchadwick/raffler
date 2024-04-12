/* main */
/* app entry point and main functions */
/* eslint-disable no-undef */
/* global Raffler */

// set to true if using /config/raffler_config.json
Raffler.config.enableLocalConfig = false
// set app environment
Raffler.config.env = RAFFLER_ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'

Raffler._currentAudioPlaying = null

/*************************************************************************
 * public methods (called from UI) *
 *************************************************************************/

// modal opening functions
async function modalOpen(type) {
  switch(type) {
    case 'help':
      this.myModal = new Modal('perm', 'How to use Raffler',
        `
          <p>Pick something from a collection at random.</p>

          <ol class="help">
            <li>Press the main raffle area to get it going</li>
            <li>Press the "PICK A WINNER!" button to start slowing down the raffler</li>
            <li>Announce the winner!
              <p>If the choice is accepted: Press "YES", the winning item is removed from the pool, and the raffler goes again. If the choice is not accepted: Press "NO", the winner remains in the pool, and the raffler goes again.</p>
              </p>
            </li>
            <li>Raffler will keep removing winners until it's left with one remaining item, and then it's done.</li>
          </ol>

          <hr />

          <p>Dev: <a href="https://michaelchadwick.info">Michael Chadwick</a>. Source: <a href="https://github.com/michaelchadwick/raffler">Github</a>.</p>
        `,
        null,
        null
      )
      break

    case 'show-config':
      this.myModal = new Modal('perm-debug', 'Raffler.config / Raffler.settings',
        Raffler._debugDisplayAppConfig(),
        null,
        null
      )
      break

    case 'reset-all':
      this.myModal = new Modal('confirm', 'Are you sure you want to reset Raffler?',
        'Note: all chosen AND user items will be lost.',
        'Yes',
        'No'
      )
      break

    case 'user-items-reset':
      this.myModal = new Modal('confirm', 'Are you sure you want to clear user-entered items?',
        'DANGER!',
        'Yes',
        'No'
      )
      break
  }
}

// app entry point
Raffler.initApp = async function() {
  Raffler._notify('Raffler init', 'notice')

  // if local, show debug stuff
  if (Raffler.config.env == 'local') {
    Raffler._initDebug()

    document.title = '(LH) ' + document.title
  }

  // load flags from URL
  Raffler._loadQueryString()

  // load global settings
  Raffler._loadSettings()

  if (Raffler.config.enableLocalConfig) {
    await Raffler._loadLocalConfig()
  } else {
    Raffler._resetApp()
  }

  Raffler._debugRefreshValues()
  Raffler._debugUpdateItemsGraph()

  // if saved chosen items exist, add them to memory and display list
  if (Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)) {
    if (Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY).length) {
      Raffler._syncItemsChosenWithItemsArr()
      Raffler._refreshItemsChosenDisplay()
      Raffler.dom.resultsWrapper.style.display = 'block'
    }
  } else {
    Raffler._setLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY, [])
  }

  Raffler._initCycleText()
  Raffler._timerStop()

  Raffler._getNebyooApps()

  Raffler._attachEventListeners()
}

Raffler.queueAudio = async function(soundId) {
  if (typeof Raffler._currentAudioPlaying == 'undefined') {
    Raffler._currentAudioPlaying = null
  }

  if (Raffler._currentAudioPlaying == null) {
    Raffler._currentAudioPlaying = soundId
    Raffler.dom.debug.spanAudioPlaying.innerHTML = '🔈'
    
    Raffler._notify(`queueAudio(): no audio playing, so playing new sound: ${Raffler._currentAudioPlaying}`)

    const audioDone = await Raffler._playAudio(soundId)

    if (audioDone) {
      Raffler._notify(`queueAudio(): audio concluded`)

      Raffler._currentAudioPlaying = null

      Raffler.dom.debug.spanAudioPlaying.innerHTML = '🔇'
    }
  } else {
    Raffler.dom.debug.spanAudioPlaying.innerHTML = '🔇'

    Raffler._notify('queueAudio(): cannot play sound, because audio is already playing')
  }
}

/*************************************************************************
 * _private methods (called from other functions) *
 *************************************************************************/

// initial message or link that will appear in the raffler before it is started
Raffler._initCycleText = function() {
  if (Raffler.config.itemsArr.length) {
    if (Raffler.config.itemsArr.length > 1) {
      Raffler.dom.itemsCycleEmpty.style.display = 'none'
      Raffler.dom.itemsCycleLimit.style.display = 'none'

      Raffler.dom.itemsCycleStart.style.display = 'block'
    } else {
      Raffler.dom.itemsCycleEmpty.style.display = 'none'
      Raffler.dom.itemsCycleStart.style.display = 'none'

      Raffler.dom.itemsCycleLimit.style.display = 'block'
    }
  } else {
    Raffler.dom.itemsCycleLimit.style.display = 'none'
    Raffler.dom.itemsCycleStart.style.display = 'none'

    Raffler.dom.itemsCycleEmpty.style.display = 'block'
  }
}
// fill in-memory itemsArr with server JSON
Raffler._initItemsArr = async function() {
  Raffler._notify(`_initItemsArr(): '${Raffler.config.dataFilePath}'`, 'notice')

  // check localStorage first
  const lsItemsAvail = Raffler._getLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY)

  if (lsItemsAvail) {
    lsItemsAvail.forEach(item => {
      Raffler.config.itemsArr.push(item)

      Raffler.dom.itemsAvailable.value += `${item}\n`
    })
  }
  // next, check local data file
  else if (Raffler.config.dataFilePath !== '') {
    const response = await fetch(Raffler.config.dataFilePath)

    if (response.ok) {
      const data = await response.json()

      if (data) {
        // clear current config's itemsArr of all items
        while (Raffler.config.itemsArr.length) {
          Raffler.config.itemsArr.pop()
        }

        Raffler.config.itemsArr.length = 0

        if (Raffler.config.itemsArr) {
          // fill itemsArr back up again
          Object.values(data).forEach((val) => {
            Raffler.config.itemsArr.push(val)
          })

          Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, Raffler.config.itemsArr)

          Raffler.__shuffleArray(Raffler.config.itemsArr)

          Raffler._debugUpdateItemsGraph()
          Raffler._refreshItemsAvailableDisplay()
          Raffler._syncItemsChosenWithItemsArr()
        }
      } else {
        Raffler._notify('Failed to process initial data load: ' + e, 'error', true)
      }
    } else {
      Raffler._notify(`Failed local data load from <code>${Raffler.config.dataFilePath}</code>`, 'error', true)
    }
  }
  // nothing saved, and nothing in config, so no items yet
  else {
    Raffler._notify('No initial data exists. Please add items in settings panel.', 'notice')

    Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, [])

    const currentVisibility = Raffler.dom.settingsPanel.style.display

    if (currentVisibility == '' || currentVisibility == 'none') {
      Raffler.dom.settingsPanel.style.display = 'block'
      Raffler.dom.mainContent.classList.add('settings-panel-enabled')

      Raffler._saveSetting('showSettings', true)
    }
  }
}

// load config from local json file, if querystring flag is true
Raffler._loadLocalConfig = async function() {
  Raffler._notify(`_loadLocalConfig()`, 'notice')

  const config = await fetch(RAFFLER_LOCAL_CONFIG_FILE)

  if (config) {
    const data = await config.json()

    if (data.dataFilePath !== '') {
      Raffler.config.dataFilePath = data.dataFilePath

      await Raffler._initItemsArr()

      Raffler._initCycleText()
    }
    if (data.logoFileLink !== '') {
      Raffler.settings.logoFileLink = data.logoFileLink
    }
    if (data.logoFilePath !== '') {
      Raffler.settings.logoFilePath = data.logoFilePath

      const span = document.createElement('span')
      span.innerText = 'at'

      const link = document.createElement('a')
      link.href = Raffler.settings.logoFileLink
      link.target = '_blank'

      const img = document.createElement('img')
      img.id = 'logo'
      img.src = Raffler.settings.logoFilePath

      link.appendChild(img)

      Raffler.dom.title.appendChild(span)
      Raffler.dom.title.appendChild(link)
    }
    if (data.talkifyKey !== '') {
      Raffler.config.talkifyKey = data.talkifyKey

      Raffler._initTalkifyConfig()
    }
  } else {
    Raffler._notify(`Local config not found at <code>${Raffler.config.configFilePath}</code>`, 'error', true)
  }
}
// load configuration flags from URL query string
Raffler._loadQueryString = function() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
  })

  Raffler._notify(`_loadQueryString(${JSON.stringify(window.location.search)})`, 'notice')

  if (params) {
    Raffler.config.enableLocalConfig = params.local_config ? true : false
  }
}

// handle both clicks and touches outside of modals
Raffler._handleClickTouch = function(event) {
  var dialog = document.getElementsByClassName('modal-dialog')[0]

  if (dialog) {
    var isConfirm = dialog.classList.contains('modal-confirm')

    // only close if not a confirmation!
    if (event.target == dialog && !isConfirm) {
      dialog.remove()
    }
  }

  if (event.target == Raffler.dom.navOverlay) {
    if (Raffler.dom.navOverlay.classList.contains('show')) {
      Raffler.dom.navOverlay.classList.remove('show')
    } else {
      Raffler.dom.navOverlay.classList.add('show')
    }
  }
}
Raffler._handleStartButton = function() {
  Raffler._notify('clicked on the start button')

  Raffler.__showPickWinnerButton()
  Raffler.__enablePickWinnerButton()
  Raffler._timerStart()
}

// reset raffler-chosen-items localStorage to nothing and update displays
Raffler._clearItemsChosen = function() {
  try {
    Raffler._setLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY, [])

    Raffler.dom.itemsChosen.value = ''
    Raffler.dom.itemsChosen.value = ''

    Raffler._notify('_clearItemsChosen(): reset', 'warning')
  } catch (e) {
    Raffler._notify('resetChosenItems: ' + e, 'error')
  }
}

// remove previously chosen items from in-memory itemsArr
Raffler._syncItemsChosenWithItemsArr = function() {
  try {
    const items = Raffler.config.itemsArr
    const chosenItems = Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)

    // if we've previously chosen items
    // we need to remove them from the raffle
    if (chosenItems && chosenItems.length > 0) {
      for (var i = 0; i < chosenItems.length; i++) {
        for (var j = 0; j < items.length; j++) {
          if (chosenItems[i].toUpperCase() === items[j].toUpperCase()) {
            Raffler.config.itemsArr.splice(j, 1)[0] // eslint-disable-line
          }
        }
      }

      Raffler._refreshItemsAvailableDisplay()
      Raffler._debugUpdateItemsGraph()

      // Raffler._notify('syncChosenItemsWithItemsArr: synced', 'notice')
    } else {
      // Raffler._notify('syncChosenItemsWithItemsArr: none to sync', 'notice')
    }

    // all items but one have been chosen on reload
    if (items.length === 1) {
      Raffler._notify('only one item left!', 'notice')

      Raffler.countdownTimer.stop()
      Raffler.__disablePickWinnerButton()

      Raffler.config.lastItemChosenConfirmed = true
      Raffler._continueRaffling()
    }

    // all items have been chosen on reload
    if (items.length === 0) {
      Raffler._notify('no items left!', 'notice')

      Raffler.countdownTimer.stop()

      Raffler.__disablePickWinnerButton()
      Raffler.__debugDisableTimerStart()
      Raffler.__debugDisableTimerStop()

      Raffler.dom.body.classList.add('level4')
      Raffler.dom.itemsCycle.innerHTML = '<div>:\'(<br /><br />Nothing to raffle!</div>'
      Raffler.dom.itemsCycle.classList.remove('stopped')

      // Raffler._notify('syncChosenItemsWithItemsArr: all items chosen', 'warning')
    }
  } catch (e) {
    Raffler._notify('syncChosenItemsWithItemsArr: ' + e, 'error')
  }
}

// update internal model when Items Available textarea changes
Raffler._updateItemsAvailable = function() {
  const items = Raffler.dom.itemsAvailable.value
    .split('\n')
    .filter(i => i !== '')

  // update count
  Raffler.dom.itemsAvailableCount.innerText = `(${items.length})`

  // update internal model
  Raffler.config.itemsArr = items
  Raffler.countdownTimer.items = Raffler.config.itemsArr

  // save to local storage
  Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, Raffler.config.itemsArr)

  // update main section accordingly
  Raffler._initCycleText()
}

// timer object to keep track of countdown
Raffler._timer = function(callbackFunc, timing) {
  if (Raffler.config.itemsArr) {
    var variableInterval = {
      items: Raffler.config.itemsArr,
      mult: RAFFLER_DEFAULT_MULTIPLY,
      stage: 0,
      interval: timing,
      callback: callbackFunc,
      stopped: false,
      startCountdown: false,
      index: Math.floor(Math.random() * Raffler.config.itemsArr.length),
      runLoop: function() {
        if (variableInterval.stopped) return
        // check to see if the time interval is at the end of a raffle
        var result = variableInterval.callback(variableInterval)

        if (typeof result === 'number') {
          if (result === 0) { return }
          variableInterval.interval = result
        }

        Raffler.config.intervalRange = result

        // switch to next item if countdown not done
        if (variableInterval.stage !== 4 && variableInterval.items.length) {
          var curIndex = variableInterval.items[variableInterval.index]

          // check for valid data
          if (curIndex) {
            var chosenItemHTML = `<div class='item'>${curIndex}</div>\n`

            Raffler.dom.itemsCycle.innerHTML = chosenItemHTML

            document.querySelectorAll('div#items-graph span').forEach((el, i) => {
              if (variableInterval.index === parseInt(el.id)) {
                el.classList.add('chosen')
              } else {
                el.classList.remove('chosen')
              }
            })

            variableInterval.index++
          } else {
            variableInterval.index = 0
          }
        }
        // reached the end of items array? back to beginning
        if (variableInterval.index === variableInterval.items.length) {
          variableInterval.index = 0
        }
        // loop
        if (variableInterval.stage !== 4) {
          variableInterval.loop()
        }
      },
      stop: function() {
        this.stopped = true
        window.clearTimeout(this.timeout)
      },
      start: function() {
        this.stopped = false
        return this.loop()
      },
      loop: function() {
        this.timeout = window.setTimeout(this.runLoop, this.interval)
        return this
      }
    }

    return variableInterval.start()
  }
}
Raffler._timerStart = function() {
  Raffler.countdownTimer.start()
  Raffler.dom.itemsCycle.classList.remove('stopped')

  Raffler.__debugDisableTimerStart()
  Raffler.__debugEnableTimerStop()

  Raffler._notify('Raffler.countdownTimer started', 'notice')
}
Raffler._timerStop = function() {
  Raffler.countdownTimer.stop()
  Raffler.dom.itemsCycle.classList.add('stopped')

  Raffler.__debugDisableTimerStop()
  Raffler.__debugEnableTimerStart()

  Raffler._notify('Raffler.countdownTimer stopped', 'notice')
}
// main timer instance for raffler cycler
Raffler.countdownTimer = Raffler._timer(async function() {
  // this is the variableInterval - so we can change/get the interval here:
  var interval = this.interval

  // console.log('Raffler._timer interval', interval)

  if (this.startCountdown) {
    // slow down at a certain point
    if (this.interval > 150 && this.interval <= 250) {
      this.stage = RAFFLER_STAGES.SLOWED

      Raffler.dom.debug.stageValue.innerText = this.stage

      if (Raffler.settings.allowBoxResize) {
        Raffler.dom.itemsCycle.className = ''
        Raffler.dom.itemsCycle.classList.add('level2')
        Raffler.dom.body.className = ''
        Raffler.dom.body.classList.add('level2')
      }
    }

    // slow down more at a certain point
    if (this.interval > 250 && this.interval <= 325) {
      this.stage = RAFFLER_STAGES.SLOWEST

      Raffler.dom.debug.stageValue.innerText = this.stage

      if (Raffler.settings.allowBoxResize) {
        Raffler.dom.itemsCycle.className = ''
        Raffler.dom.itemsCycle.classList.add('level3')
        Raffler.dom.body.className = ''
        Raffler.dom.body.classList.add('level3')
      }
    }

    // finally, stop and pick an item!
    if (this.interval > 325) {
      this.mult = RAFFLER_DEFAULT_MULTIPLY

      if (this.interval > 350) {
        this.mult = this.mult++
      }

      // WINNER WINNER CHICKEN DINNER
      if (this.interval >= Raffler.config.lastInterval) {
        this.stage = RAFFLER_STAGES.DONE

        Raffler.dom.debug.stageValue.innerText = this.stage

        this.startCountdown = false
        this.stop()

        if (Raffler.settings.allowBoxResize) {
          Raffler.dom.itemsCycle.className = ''
        }

        Raffler.dom.itemsCycle.classList.add('level-win')
        Raffler.dom.body.classList.add('level4')

        if (Raffler.settings.sound.victory) {
          Raffler.queueAudio('victory')

          // Raffler.myAudioWorker.postMessage({
          //   command: 'playAudio',
          //   data: 'victory'
          // })
        }

        Raffler.config.lastItemChosen = document.querySelector('div.item').innerText

        if (Raffler.settings.sound.name) {
          Raffler._readName(Raffler.config.lastItemChosen)

          // Raffler.myAudioWorker.postMessage({
          //   command: 'readName',
          //   data: Raffler.config.lastItemChosen
          // })
        }

        // confirm winner
        Raffler.__enableChosenConfirm()

        // increment counter of times run
        Raffler.config.timesRun++
        Raffler.dom.debug.timesRun.innerText = Raffler.config.timesRun
      } else {
        var intervalMult = interval + this.mult

        Raffler.config.intervalRange = intervalMult

        return intervalMult
      }
    }
  }

  // start countdown!
  if (this.startCountdown && (this.stage === RAFFLER_STAGES.INIT || this.stage === RAFFLER_STAGES.BEGUN)) {
    this.stage = RAFFLER_STAGES.BEGUN

    Raffler.dom.debug.stageValue.innerText = this.stage

    if (!Raffler.dom.itemsCycle.classList.contains('level1')) {
      Raffler.dom.itemsCycle.classList.add('level1')
    }

    if (Raffler.settings.sound.countdown) {
      Raffler.queueAudio('countdown')

      // Raffler.myAudioWorker.postMessage({
      //   command: 'playAudio',
      //   data: 'countdown'
      // })
    }
  }

  // if we've started countdown and we haven't reached end
  // then keep cycling with increased multiplier
  if (this.stage > RAFFLER_STAGES.INIT && this.stage !== RAFFLER_STAGES.DONE) {
    var newInterval = interval + (1.75 ^ this.mult++)

    Raffler.config.multiplyValue = this.mult
    Raffler.config.intervalRange = newInterval

    Raffler._debugRefreshValues()

    return newInterval
  }
}, RAFFLER_DEFAULT_INTERVAL_RANGE)

// user interacted with the "PICK A WINNER" button
Raffler._pickAWinner = async function() {
  Raffler._notify('PICKING A WINNER...', 'notice')
  Raffler.__disablePickWinnerButton()

  if (Raffler.settings.allowBoxResize) {
    Raffler.dom.itemsCycle.className = ''
  } else {
    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level4')
  }

  // we got a choice
  // start a countdown
  if (Raffler.config.itemsArr.length > 1) {
    Raffler.config.intervalRange = RAFFLER_DEFAULT_INTERVAL_RANGE

    // console.log('_pickAWinner: Raffler.config.intervalRange reset', Raffler.config.intervalRange)

    Raffler.dom.debug.stageValue.innerText = Raffler.countdownTimer.stage

    Raffler.countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE

    // console.log('_pickAWinner: Raffler.countdownTimer.interval reset', Raffler.countdownTimer.interval)

    Raffler.countdownTimer.index = Math.floor(Math.random() * Raffler.config.itemsArr.length)
    Raffler.countdownTimer.stage = RAFFLER_STAGES.INIT
    Raffler.countdownTimer.startCountdown = true
    Raffler.countdownTimer.mult = 1
    Raffler.countdownTimer.start()
  }
  // we got 1 choice, so no choice, no countdown
  if (Raffler.config.itemsArr.length === 1) {
    Raffler._notify('Only one item to raffle!<br /><strong>instant winner!</strong>', 'warning', true)

    Raffler._timerStop()

    // add lone item to items-cycle
    let loneItemHTML = '<div class=\'item\'>' + Raffler.config.itemsArr[0].name + '</div>'

    Raffler.dom.itemsCycle.innerHTML = loneItemHTML
    Raffler.dom.itemsCycle.classList.add('level4')

    // grab lone item
    Raffler.config.lastItemChosen = document.querySelector('div.item').innerText

    if (Raffler.settings.allowBoxResize) {
      Raffler.dom.itemsCycle.className = ''
    }

    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level-win')
    Raffler.dom.body.classList.add('level4')

    if (Raffler.settings.sound.victory) {
      Raffler.queueAudio('victory')

      // Raffler.myAudioWorker.postMessage({
      //   command: 'playAudio',
      //   data: 'victory'
      // })
    }

    if (Raffler.settings.sound.name) {
      Raffler._readName(Raffler.config.lastItemChosen)

      // Raffler.myAudioWorker.postMessage({
      //   command: 'readName',
      //   data: Raffler.config.lastItemChosen
      // })
    }

    Raffler._addItemChosenToLocalStorage(Raffler.config.lastItemChosen)
    // add to list of chosen items and update displays
    Raffler._refreshItemsChosenDisplay()
    // update results count
    Raffler._refreshResultsCount()

    Raffler.config.itemsArr = []
    Raffler._debugUpdateItemsGraph()
    Raffler._refreshItemsAvailableDisplay()

    Raffler._notify('Raffled successfully! ' + Raffler.config.lastItemChosen.name + ' chosen!', 'success')

    // increment counter of times run
    Raffler.config.timesRun++
    Raffler.dom.debug.timesRun.innerText = Raffler.config.timesRun
  }

  Raffler._debugRefreshValues()
}

// after confirming a winner or not, go back to raffling
Raffler._continueRaffling = function() {
  // if we have confirmed, then take out of raffle
  if (Raffler.config.lastItemChosenConfirmed) {
    if (Raffler.config.lastItemChosen !== '') {
      // add chosen item to localStorage
      Raffler._addItemChosenToLocalStorage(Raffler.config.lastItemChosen)
      // add to list of chosen items and update displays
      Raffler._refreshItemsChosenDisplay()
      // update results count
      Raffler._refreshResultsCount()

      const item = Raffler.config.lastItemChosen
      const items = Raffler.config.itemsArr

      for (var i = 0; i < items.length; i++) {
        if (items[i].toUpperCase() === item.toUpperCase()) {
          items.splice(i, 1)
          Raffler._debugUpdateItemsGraph()
          Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, Raffler.config.itemsArr)
          Raffler._refreshItemsAvailableDisplay()
          break
        }
      }

      Raffler._notify('Raffled successfully! ' + Raffler.config.lastItemChosen.name + ' chosen!', 'success')
    } else {
      Raffler._notify('Choice could not be made. Pool of choices unchanged.', 'warning')
    }
  } else {
    Raffler._notify('Choice rejected. Pool of choices unchanged.', 'notice')
  }

  // either way, disable confirm buttons
  // and re-enable raffler
  Raffler.__disableChosenConfirm()
  Raffler.__enablePickWinnerButton()

  // start an infinite cycle
  Raffler.countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE

  // console.log('_continueRaffling: Raffler.countdownTimer.interval reset', Raffler.countdownTimer.interval)

  Raffler.countdownTimer.mult = 1
  Raffler.countdownTimer.stage = RAFFLER_STAGES.INIT
  Raffler.countdownTimer.index = Math.floor(Math.random() * Raffler.config.itemsArr.length)

  Raffler.config.intervalRange = RAFFLER_DEFAULT_INTERVAL_RANGE

  // console.log('_continueRaffling: Raffler.config.intervalRange reset', Raffler.config.intervalRange)

  Raffler.dom.debug.intervalValue.value = Raffler.config.intervalRange

  Raffler.dom.debug.stageValue.innerText = Raffler.countdownTimer.stage

  if (Raffler.settings.allowBoxResize) {
    Raffler.dom.body.className = ''
    Raffler.dom.itemsCycle.className = ''
  } else {
    Raffler.dom.body.classList.add('level4')
    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level4')
  }

  Raffler._debugRefreshValues()

  Raffler.countdownTimer.startCountdown = false

  if (Raffler.config.itemsArr.length > 1) {
    Raffler.countdownTimer.start()
  } else {
    const lastItem = Raffler.config.itemsArr[0]

    Raffler._addItemChosenToLocalStorage(lastItem)
    Raffler._refreshItemsChosenDisplay()

    Raffler.config.itemsArr = []
    Raffler._refreshItemsAvailableDisplay()

    Raffler.dom.body.classList = 'level4'
    Raffler.dom.itemsCycle.classList.add('level-win')

    Raffler.dom.itemsCycle.innerHTML = `<div>Only one choice left:</div><div class='item'>${lastItem}</div>`

    Raffler.__disablePickWinnerButton()
  }
}

// handy combo shortcut of methods to reset application
Raffler._resetApp = function() {
  Raffler._initItemsArr()

  Raffler.config.lastItemChosen = ''
  Raffler.config.timesRun = 0

  Raffler._refreshItemsAvailableDisplay()
  Raffler._refreshResultsCount()
  Raffler._debugRefreshValues()

  Raffler._notify('Raffler reset', 'notice')
}
Raffler._resetCountdown = function() {
  Raffler._clearItemsChosen()

  Raffler.config.timesRun = 0

  Raffler.dom.body.classList = ''
  Raffler.dom.itemsCycle.classList = ''

  Raffler.dom.resultsContent.innerText = ''
  Raffler.dom.resultsWrapper.style.display = 'none'

  Raffler.countdownTimer.startCountdown = false
  Raffler.countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE
  Raffler.countdownTimer.mult = RAFFLER_DEFAULT_MULTIPLY
  Raffler.countdownTimer.stage = RAFFLER_STAGES.INIT
  Raffler.countdownTimer.start()

  Raffler.__showPickWinnerButton()
  Raffler.__enablePickWinnerButton()

  Raffler._debugRefreshValues()

  Raffler._initItemsArr()

  Raffler._timerStart()

  Raffler.dom.btnPickWinner.focus()
}

// attach event handlers to buttons and such
Raffler._attachEventListeners = function() {
  // top-left icons to open modals
  Raffler.dom.btnNav.addEventListener('click', () => {
    Raffler.dom.navOverlay.classList.toggle('show')
  })
  Raffler.dom.btnNavClose.addEventListener('click', () => {
    Raffler.dom.navOverlay.classList.toggle('show')
  })
  Raffler.dom.btnHelp.addEventListener('click', () => {
    modalOpen('help')
  })
  // local debug top-left icon
  if (Raffler.config.env == 'local') {
    if (Raffler.dom.debug.container) {
      // ⚙ show current Raffler config
      Raffler.dom.debug.btnShowConfig.addEventListener('click', () => {
        modalOpen('show-config')
      })
    }
  }

  // top-right settings (gear) menu
  Raffler.dom.btnSettings.addEventListener('click', () => {
    Raffler._toggleSettingsPanel()
  })
  Raffler.dom.btnSettingsPanelClose.addEventListener('click', () => {
    Raffler._toggleSettingsPanel()
  })

  if (Raffler.dom.btnShowDebugSettings) {
    Raffler.dom.btnShowDebugSettings.addEventListener('click', () => {
      Raffler._toggleSettingsShowDebug()
    })
  }

  Raffler.dom.itemsAvailable.addEventListener('keyup', () => {
    Raffler._updateItemsAvailable()
  })

  // debug settings
  Raffler.dom.debug.btnTestSoundCountdown.addEventListener('click', () => {
    Raffler.queueAudio('countdown')
  })
  Raffler.dom.debug.btnTestSoundVictory.addEventListener('click', () => {
    Raffler.queueAudio('victory')
  })
  Raffler.dom.debug.btnTimerStart.addEventListener('click', () => {
    if (Raffler.dom.debug.btnTimerStart.getAttribute('disabled') !== 'true') {
      Raffler._notify('starting timer', 'notice')

      Raffler.__showPickWinnerButton()
      Raffler.__enablePickWinnerButton()
      Raffler._timerStart()
    }
  })
  Raffler.dom.debug.btnTimerStop.addEventListener('click', () => {
    if (Raffler.dom.debug.btnTimerStop.getAttribute('disabled') !== 'true') {
      Raffler._notify('stopping timer', 'notice')

      Raffler._timerStop()
    }
  })

  if (!Raffler.dom.debug.btnResetCountdown.getAttribute('disabled')) {
    Raffler.dom.debug.btnResetCountdown.addEventListener('click', async () => {
      const resetConfirm = new Modal('confirm', 'Are you sure you want to reset choices?',
        'Note: all chosen items will be lost.',
        'Yes',
        'No'
      )

      try {
        // wait for modal confirmation
        const confirmed = await resetConfirm.question()

        if (confirmed) {
          Raffler._resetCountdown()
        }
      } catch (err) {
        console.error('countdown reset failed', err)
      }
    })
  }
  if (!Raffler.dom.debug.btnResetAll.getAttribute('disabled')) {
    Raffler.dom.debug.btnResetAll.addEventListener('click', async () => {
      const resetConfirm = new Modal('confirm', 'Are you sure you want to reset everything?',
        'Note: all chosen AND user items will be lost.',
        'Yes',
        'No'
      )

      try {
        // wait for modal confirmation
        const confirmed = await resetConfirm.question()

        if (confirmed) {
          Raffler._resetApp()
        }
      } catch (err) {
        console.error('app reset failed', err)
      }
    })
  }

  // main raffling events
  Raffler.dom.itemsCycleStart.addEventListener('click', () => {
    Raffler._handleStartButton()
  })
  Raffler.dom.btnPickWinner.addEventListener('click', (e) => {
    e.preventDefault()
    if (!Raffler.dom.btnPickWinner.hasAttribute('disabled')) {
      Raffler._pickAWinner()
    }
  })
  Raffler.dom.btnChosenConfirmYes.addEventListener('click', () => {
    Raffler.config.lastItemChosen = document.querySelector('div#items-cycle div.item').innerText

    console.log('btnChosenConfirmYes', Raffler.config.lastItemChosen)

    Raffler.config.lastItemChosenConfirmed = true

    Raffler._continueRaffling()
  })
  Raffler.dom.btnChosenConfirmNo.addEventListener('click', () => {
    Raffler.config.lastItemChosenConfirmed = false
    Raffler._continueRaffling()
  })
  Raffler.dom.btnExportResults.addEventListener('click', (e) => {
    // export.js
    Raffler._exportResults()
  })

  window.addEventListener('click', Raffler._handleClickTouch)
  window.addEventListener('touchend', Raffler._handleClickTouch)
}

/*************************************************************************
 * _private __helper methods *
 *************************************************************************/

// encode user entries html
Raffler.__sanitize = function(newEntry) {
  Object.values(newEntry).forEach((val) => {
    newEntry.val = val.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/""/g, '&quot;')
  })

  return newEntry
}

// check if User Items are valid before syncing
Raffler.__userItemsValid = function(items) {
  let userItems = items.split('\n').filter(item => item != '')

  if (userItems.length) {
    if (userItems.every(item => item.split(',').length == 2)) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

Raffler.__shuffleArray = function(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

Raffler.__disablePickWinnerButton = function() {
  Raffler.dom.body.className = ''
  Raffler.dom.btnPickWinner.setAttribute('disabled', true)
  Raffler.dom.btnPickWinner.classList.add('disabled')
}
Raffler.__enablePickWinnerButton = function() {
  Raffler.dom.btnPickWinner.removeAttribute('disabled')
  Raffler.dom.btnPickWinner.classList.remove('disabled')
}
Raffler.__showPickWinnerButton = function() {
  Raffler.dom.pickWinnerContainer.style.display = 'block'
}

Raffler.__disableChosenConfirm = function() {
  Raffler._notify('hiding confirmation question', 'notice')

  Raffler.dom.chosenConfirm.style.display = 'none'

  Raffler.dom.btnChosenConfirmYes.setAttribute('disabled', true)
  Raffler.dom.btnChosenConfirmYes.classList.add('disabled')
  Raffler.dom.btnChosenConfirmNo.setAttribute('disabled', true)
  Raffler.dom.btnChosenConfirmNo.classList.add('disabled')

  Raffler.__debugEnableTimerStop()
}
Raffler.__enableChosenConfirm = function() {
  Raffler._notify('showing confirmation question', 'notice')

  Raffler.dom.chosenConfirm.style.display = 'block'

  Raffler.dom.btnChosenConfirmYes.removeAttribute('disabled')
  Raffler.dom.btnChosenConfirmYes.classList.remove('disabled')
  Raffler.dom.btnChosenConfirmNo.removeAttribute('disabled')
  Raffler.dom.btnChosenConfirmNo.classList.remove('disabled')

  Raffler.__debugDisableTimerStart()
  Raffler.__debugDisableTimerStop()
}

/************************************************************************
 * START THE ENGINE *
 ************************************************************************/

// get it going
window.onload = Raffler.initApp()
