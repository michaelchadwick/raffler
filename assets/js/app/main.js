/* main */
/* app entry point and main functions */
/* eslint-disable no-undef */
/* global Raffler */

// set to true, or use '?local_config=1, if using /config/raffler_config.json
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
Raffler.initApp = async function () {
  Raffler._notify('Raffler init', 'notice')

  // if local, show debug stuff
  if (Raffler.config.env == 'local') {
    Raffler._initDebug()

    document.title = '(LH) ' + document.title
  }

  // load flags from URL
  Raffler._loadQueryString()

  // load global settings
  Raffler._loadLocalStorageSettings()

  if (Raffler.config.enableLocalConfig) {
    await Raffler._loadLocalConfig()
  }

  Raffler._resetApp()
  Raffler._debugRefreshValues()
  Raffler._debugUpdateItemsGraph()

  // if saved chosen items exist, add them to memory and display list
  if (Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)) {
    if (Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY).length) {
      Raffler._syncItemsChosenWithItemsArr()
      Raffler._loadLocalStorageItemsChosen()
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

// reset everything to default state
Raffler._resetApp = async function () {
  await Raffler._loadItemsArrFromLocalStorage()

  Raffler._loadInMemoryItemsAvailable()
  Raffler._loadLocalStorageResultsCount()
  Raffler._debugRefreshValues()

  Raffler.config.lastItemChosen = ''
  Raffler.config.timesRun = 0

  Raffler._notify('Raffler resetApp()', 'notice')
}

/*************************************************************************
 * _private methods (called from other functions) *
 *************************************************************************/

// initial message or link that will appear in the raffler before it is started
Raffler._initCycleText = function () {
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
// fill in-memory itemsArr with data
// 1. [localStorage] - previous data; if empty, skip
// 2. [] - no previous data
Raffler._loadItemsArrFromLocalStorage = async function () {
  Raffler._notify(
    `_loadItemsArrFromLocalStorage(): loading LS -> Raffler.config.itemsArr`,
    'notice'
  )

  const lsItemsAvail = Raffler._getLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY)

  if (lsItemsAvail?.length) {
    lsItemsAvail.forEach((item) => {
      // set in-memory
      Raffler.config.itemsArr.push(item)

      // set settings UI
      Raffler.dom.settings.itemsAvailable.value += `${item}\n`
    })

    Raffler._loadLocalStorageResultsCount()
  }
  // nothing saved, so no items, available or chosen, yet
  else {
    Raffler._notify('No localStorage data exists. Please add items in settings panel.', 'notice')

    Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, [])

    const currentVisibility = Raffler.dom.settingsPanel.style.display

    if (currentVisibility == '' || currentVisibility == 'none') {
      Raffler.dom.settingsPanel.style.display = 'block'
      Raffler.dom.mainContent.classList.add('settings-panel-enabled')

      Raffler._saveSetting('showSettings', true)
    }
  }

  Raffler._notify(
    `_loadItemsArrFromLocalStorage(): Raffler.config.itemsArr: ${Raffler.config.itemsArr}`,
    'notice'
  )
}

// load config from local json file, if querystring flag is true
Raffler._loadLocalConfig = async function () {
  Raffler._notify(`_loadLocalConfig()`, 'notice')

  const config = await fetch(RAFFLER_LOCAL_CONFIG_FILE)

  if (config) {
    const data = await config.json()

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

      Raffler.dom.header.title.appendChild(span)
      Raffler.dom.header.title.appendChild(link)
    }
  } else {
    Raffler._notify(
      `Local config not found at <code>${Raffler.config.configFilePath}</code>`,
      'error',
      true
    )
  }
}
// load configuration flags from URL query string
Raffler._loadQueryString = function () {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })

  // Raffler._notify(`_loadQueryString(${JSON.stringify(window.location.search)})`, 'notice')

  if (params) {
    Raffler.config.enableLocalConfig = params.local_config ? true : false
  }
}

// handle both clicks and touches outside of modals
Raffler._handleClickTouch = function (event) {
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
Raffler._handleStartButton = function () {
  Raffler._notify('clicked on the start button')

  Raffler.__showPickWinnerButton()
  Raffler.__enablePickWinnerButton()
  Raffler._timerStart()
}

// reset raffler-chosen-items localStorage to nothing and update displays
Raffler._clearItemsChosen = function () {
  try {
    Raffler._setLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY, [])

    Raffler.dom.settings.itemsChosen.value = ''

    Raffler._loadLocalStorageItemsChosen()

    Raffler._notify('_clearItemsChosen(): reset', 'warning')
  } catch (e) {
    Raffler._notify('resetChosenItems: ' + e, 'error')
  }
}

// remove previously chosen items from in-memory itemsArr
Raffler._syncItemsChosenWithItemsArr = function () {
  try {
    const itemsAvailable = Raffler.config.itemsArr
    const itemsChosen = Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)

    // if we've previously chosen items
    // we need to remove them from the raffle
    if (itemsChosen?.length) {
      for (var i = 0; i < itemsChosen.length; i++) {
        for (var j = 0; j < itemsAvailable.length; j++) {
          if (itemsChosen[i].toUpperCase() === itemsAvailable[j].toUpperCase()) {
            Raffler.config.itemsArr.splice(j, 1)[0] // eslint-disable-line
          }
        }
      }

      Raffler._loadInMemoryItemsAvailable()
      Raffler._debugUpdateItemsGraph()

      // Raffler._notify('_syncItemsChosenWithItemsArr: synced', 'notice')
    } else {
      // Raffler._notify('_syncItemsChosenWithItemsArr: none to sync', 'notice')
    }

    // all items but one have been chosen on reload
    if (itemsAvailable.length === 1) {
      Raffler._notify('only one item left!', 'notice')

      Raffler._countdownTimer.stop()
      Raffler.__disablePickWinnerButton()

      Raffler.config.lastItemChosenConfirmed = true
      Raffler._continueRaffling()
    }

    // all items have been chosen on reload
    if (itemsAvailable.length === 0 && itemsChosen?.length) {
      Raffler._notify('no items left!', 'notice')

      Raffler._countdownTimer.stop()

      Raffler.__disablePickWinnerButton()
      Raffler.__debugDisableTimerStart()
      Raffler.__debugDisableTimerStop()

      Raffler.dom.body.classList.add('level4')
      Raffler.dom.itemsCycle.innerHTML = "<div>:'(<br /><br />Nothing to raffle!</div>"
      Raffler.dom.itemsCycle.classList.remove('stopped')

      // Raffler._notify('_syncItemsChosenWithItemsArr: all items chosen', 'warning')
    }
  } catch (e) {
    Raffler._notify('_syncItemsChosenWithItemsArr: ' + e, 'error')
  }
}

// update internal model when Items Available textarea changes
Raffler._updateItemsAvailable = function () {
  const items = Raffler.dom.settings.itemsAvailable.value.split('\n').filter((i) => i !== '')

  // update count
  Raffler.dom.settings.itemsAvailableCount.innerText = `(${items.length})`

  // update internal model
  Raffler.config.itemsArr = items
  Raffler._countdownTimer.items = Raffler.config.itemsArr

  // save to local storage
  Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, Raffler.config.itemsArr)

  // update main section accordingly
  Raffler._initCycleText()
}

// timer object to keep track of countdown
Raffler._timer = function (callbackFunc, timing) {
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
      runLoop: function () {
        if (variableInterval.stopped) return
        // check to see if the time interval is at the end of a raffle
        var result = variableInterval.callback(variableInterval)

        if (typeof result === 'number') {
          if (result === 0) {
            return
          }
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
      stop: function () {
        this.stopped = true
        window.clearTimeout(this.timeout)
      },
      start: function () {
        this.stopped = false
        return this.loop()
      },
      loop: function () {
        this.timeout = window.setTimeout(this.runLoop, this.interval)
        return this
      },
    }

    return variableInterval.start()
  }
}
Raffler._timerStart = function () {
  Raffler._countdownTimer.start()
  Raffler.dom.itemsCycle.classList.remove('stopped')

  Raffler.__debugDisableTimerStart()
  Raffler.__debugEnableTimerStop()

  Raffler._notify('Raffler._countdownTimer started', 'notice')
}
Raffler._timerStop = function () {
  Raffler._countdownTimer.stop()
  Raffler.dom.itemsCycle.classList.add('stopped')

  Raffler.__debugDisableTimerStop()
  Raffler.__debugEnableTimerStart()

  Raffler._notify('Raffler._countdownTimer stopped', 'notice')
}

// user interacted with the "PICK A WINNER" button
Raffler._pickAWinner = async function () {
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

    Raffler.dom.settings.debug.stageValue.innerText = Raffler._countdownTimer.stage

    Raffler._countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE

    // console.log('_pickAWinner: Raffler._countdownTimer.interval reset', Raffler._countdownTimer.interval)

    Raffler._countdownTimer.index = Math.floor(Math.random() * Raffler.config.itemsArr.length)
    Raffler._countdownTimer.stage = RAFFLER_STAGES.INIT
    Raffler._countdownTimer.startCountdown = true
    Raffler._countdownTimer.mult = 1
    Raffler._countdownTimer.start()
  }
  // we got 1 choice, so no choice, no countdown
  if (Raffler.config.itemsArr.length === 1) {
    Raffler._notify(
      'Only one item to raffle!<br /><strong>instant winner!</strong>',
      'warning',
      true
    )

    Raffler._timerStop()

    // add lone item to items-cycle
    let loneItemHTML = "<div class='item'>" + Raffler.config.itemsArr[0].name + '</div>'

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
      Raffler._queueAudio('victory')

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
    Raffler._loadLocalStorageItemsChosen()
    // update results count
    Raffler._loadLocalStorageResultsCount()

    Raffler.config.itemsArr = []
    Raffler._debugUpdateItemsGraph()
    Raffler._loadInMemoryItemsAvailable()

    Raffler._notify(`Raffled successfully! '${Raffler.config.lastItemChosen}' chosen!`, 'success')

    // increment counter of times run
    Raffler.config.timesRun++
    Raffler.dom.settings.debug.timesRun.innerText = Raffler.config.timesRun
  }

  Raffler._debugRefreshValues()
}

// after confirming a winner or not, go back to raffling
Raffler._continueRaffling = function () {
  // if we have confirmed, then take out of raffle
  if (Raffler.config.lastItemChosenConfirmed) {
    if (Raffler.config.lastItemChosen !== '') {
      // add chosen item to localStorage
      Raffler._addItemChosenToLocalStorage(Raffler.config.lastItemChosen)
      // add to list of chosen items and update displays
      Raffler._loadLocalStorageItemsChosen()
      // update results count
      Raffler._loadLocalStorageResultsCount()

      const item = Raffler.config.lastItemChosen
      const items = Raffler.config.itemsArr

      for (var i = 0; i < items.length; i++) {
        if (items[i].toUpperCase() === item.toUpperCase()) {
          items.splice(i, 1)
          Raffler._debugUpdateItemsGraph()
          Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, Raffler.config.itemsArr)
          Raffler._loadInMemoryItemsAvailable()
          break
        }
      }

      Raffler._notify(`Raffled successfully! '${Raffler.config.lastItemChosen}' chosen!`, 'success')
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
  Raffler._countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE

  // console.log('_continueRaffling: Raffler._countdownTimer.interval reset', Raffler._countdownTimer.interval)

  Raffler._countdownTimer.mult = 1
  Raffler._countdownTimer.stage = RAFFLER_STAGES.INIT
  Raffler._countdownTimer.index = Math.floor(Math.random() * Raffler.config.itemsArr.length)

  Raffler.config.intervalRange = RAFFLER_DEFAULT_INTERVAL_RANGE

  // console.log('_continueRaffling: Raffler.config.intervalRange reset', Raffler.config.intervalRange)

  Raffler.dom.settings.debug.intervalValue.value = Raffler.config.intervalRange

  Raffler.dom.settings.debug.stageValue.innerText = Raffler._countdownTimer.stage

  if (Raffler.settings.allowBoxResize) {
    Raffler.dom.body.className = ''
    Raffler.dom.itemsCycle.className = ''
  } else {
    Raffler.dom.body.classList.add('level4')
    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level4')
  }

  Raffler._debugRefreshValues()

  Raffler._countdownTimer.startCountdown = false

  if (Raffler.config.itemsArr.length > 1) {
    Raffler._countdownTimer.start()
  } else {
    const lastItem = Raffler.config.itemsArr[0]

    Raffler._addItemChosenToLocalStorage(lastItem)
    Raffler._loadLocalStorageItemsChosen()

    Raffler.config.itemsArr = []
    Raffler._loadInMemoryItemsAvailable()

    Raffler.dom.body.classList = 'level4'
    Raffler.dom.itemsCycle.classList.add('level-win')

    Raffler.dom.itemsCycle.innerHTML = `<div>Only one choice left:</div><div class='item'>${lastItem}</div>`

    Raffler.__disablePickWinnerButton()
  }
}

// reset countdown as if no items were ever chosen
Raffler._resetCountdown = async function () {
  Raffler._clearItemsChosen()

  await Raffler._loadItemsArrFromLocalStorage()

  Raffler.config.timesRun = 0

  Raffler.dom.body.classList = ''
  Raffler.dom.itemsCycle.classList = ''

  Raffler.dom.resultsList.innerText = ''
  Raffler.dom.resultsWrapper.style.display = 'none'

  Raffler._countdownTimer.startCountdown = false
  Raffler._countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE
  Raffler._countdownTimer.mult = RAFFLER_DEFAULT_MULTIPLY
  Raffler._countdownTimer.stage = RAFFLER_STAGES.INIT
  Raffler._countdownTimer.start()

  Raffler.__showPickWinnerButton()
  Raffler.__enablePickWinnerButton()

  Raffler._loadInMemoryItemsAvailable()
  Raffler._loadLocalStorageItemsChosen()
  Raffler._loadLocalStorageResultsCount()
  Raffler._debugRefreshValues()

  Raffler._timerStart()

  Raffler.dom.btnPickWinner.focus()

  Raffler._notify('Raffler resetCountdown()', 'notice')
}


// attach event handlers to buttons and such
Raffler._attachEventListeners = function () {
  // top-left icons to open modals
  Raffler.dom.header.btnNav.addEventListener('click', () => {
    Raffler.dom.header.navOverlay.classList.toggle('show')
  })
  Raffler.dom.header.btnNavClose.addEventListener('click', () => {
    Raffler.dom.navOverlay.classList.toggle('show')
  })
  Raffler.dom.header.btnHelp.addEventListener('click', () => {
    modalOpen('help')
  })
  // local debug top-left icon
  if (Raffler.config.env == 'local') {
    if (Raffler.dom.header.debug.container) {
      // ⚙ show current Raffler config
      Raffler.dom.header.debug.btnShowConfig.addEventListener('click', () => {
        modalOpen('show-config')
      })
    }
  }

  // top-right settings (gear) menu
  Raffler.dom.header.btnSettings.addEventListener('click', () => {
    Raffler._toggleSettingsPanel()
  })
  Raffler.dom.settings.btnSettingsPanelClose.addEventListener('click', () => {
    Raffler._toggleSettingsPanel()
  })

  if (Raffler.dom.settings.btnShowDebugSettings) {
    Raffler.dom.settings.btnShowDebugSettings.addEventListener('click', () => {
      Raffler._toggleSettingsShowDebug()
    })
  }

  Raffler.dom.settings.itemsAvailable.addEventListener('keyup', () => {
    Raffler._updateItemsAvailable()
  })

  // debug settings
  Raffler.dom.settings.debug.btnTestSoundCountdown.addEventListener('click', () => {
    Raffler._queueAudio('countdown')
  })
  Raffler.dom.settings.debug.btnTestSoundVictory.addEventListener('click', () => {
    Raffler._queueAudio('victory')
  })
  Raffler.dom.settings.debug.btnTimerStart.addEventListener('click', () => {
    if (Raffler.dom.settings.debug.btnTimerStart.getAttribute('disabled') !== 'true') {
      Raffler._notify('starting timer', 'notice')

      Raffler.__showPickWinnerButton()
      Raffler.__enablePickWinnerButton()
      Raffler._timerStart()
    }
  })
  Raffler.dom.settings.debug.btnTimerStop.addEventListener('click', () => {
    if (Raffler.dom.settings.debug.btnTimerStop.getAttribute('disabled') !== 'true') {
      Raffler._notify('stopping timer', 'notice')

      Raffler._timerStop()
    }
  })

  if (!Raffler.dom.settings.debug.btnResetCountdown.getAttribute('disabled')) {
    Raffler.dom.settings.debug.btnResetCountdown.addEventListener('click', async () => {
      const resetConfirm = new Modal(
        'confirm',
        'Are you sure you want to reset choices?',
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
  if (!Raffler.dom.settings.debug.btnResetAll.getAttribute('disabled')) {
    Raffler.dom.settings.debug.btnResetAll.addEventListener('click', async () => {
      const resetConfirm = new Modal(
        'confirm',
        'Are you sure you want to reset everything?',
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

// main timer instance for raffler cycler
Raffler._countdownTimer = Raffler._timer(function () {
  // this is the variableInterval - so we can change/get the interval here:
  var interval = this.interval

  // console.log('Raffler._timer interval', interval)

  if (this.startCountdown) {
    // slow down at a certain point
    if (this.interval > 150 && this.interval <= 250) {
      this.stage = RAFFLER_STAGES.SLOWED

      Raffler.dom.settings.debug.stageValue.innerText = this.stage

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

      Raffler.dom.settings.debug.stageValue.innerText = this.stage

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

        Raffler.dom.settings.debug.stageValue.innerText = this.stage

        this.startCountdown = false
        this.stop()

        if (Raffler.settings.allowBoxResize) {
          Raffler.dom.itemsCycle.className = ''
        }

        Raffler.dom.itemsCycle.classList.add('level-win')
        Raffler.dom.body.classList.add('level4')

        if (Raffler.settings.sound.victory) {
          Raffler._queueAudio('victory')

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
        Raffler.dom.settings.debug.timesRun.innerText = Raffler.config.timesRun
      } else {
        var intervalMult = interval + this.mult

        Raffler.config.intervalRange = intervalMult

        return intervalMult
      }
    }
  }

  // start countdown!
  if (
    this.startCountdown &&
    (this.stage === RAFFLER_STAGES.INIT || this.stage === RAFFLER_STAGES.BEGUN)
  ) {
    this.stage = RAFFLER_STAGES.BEGUN

    Raffler.dom.settings.debug.stageValue.innerText = this.stage

    if (!Raffler.dom.itemsCycle.classList.contains('level1')) {
      Raffler.dom.itemsCycle.classList.add('level1')
    }

    if (Raffler.settings.sound.countdown) {
      // only trigger the countdown sound once
      if (this.interval == 25) {
        Raffler._queueAudio('countdown')
      }

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

/************************************************************************
 * START THE ENGINE *
 ************************************************************************/

// get it going
window.onload = Raffler.initApp()
