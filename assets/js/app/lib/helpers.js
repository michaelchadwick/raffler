/* helpers */
/* general purpose functions */
/* global Raffler */

Raffler.__disablePickWinnerButton = function () {
  Raffler.dom.body.className = ''
  Raffler.dom.btnPickWinner.setAttribute('disabled', true)
  Raffler.dom.btnPickWinner.classList.add('disabled')
}
Raffler.__enablePickWinnerButton = function () {
  Raffler.dom.btnPickWinner.removeAttribute('disabled')
  Raffler.dom.btnPickWinner.classList.remove('disabled')
}
Raffler.__showPickWinnerButton = function () {
  Raffler.dom.pickWinnerContainer.style.display = 'block'
}

Raffler.__disableChosenConfirm = function () {
  // Raffler._notify('hiding confirmation question', 'notice')

  Raffler.dom.chosenConfirm.style.display = 'none'

  Raffler.dom.btnChosenConfirmYes.setAttribute('disabled', true)
  Raffler.dom.btnChosenConfirmYes.classList.add('disabled')
  Raffler.dom.btnChosenConfirmNo.setAttribute('disabled', true)
  Raffler.dom.btnChosenConfirmNo.classList.add('disabled')

  Raffler.__debugEnableTimerStop()
}
Raffler.__enableChosenConfirm = function () {
  Raffler._notify('showing confirmation question', 'notice')

  Raffler.dom.chosenConfirm.style.display = 'block'

  Raffler.dom.btnChosenConfirmYes.removeAttribute('disabled')
  Raffler.dom.btnChosenConfirmYes.classList.remove('disabled')
  Raffler.dom.btnChosenConfirmNo.removeAttribute('disabled')
  Raffler.dom.btnChosenConfirmNo.classList.remove('disabled')

  Raffler.__debugDisableTimerStart()
  Raffler.__debugDisableTimerStop()
}

// get list of other existing NebyooApps for sidebar
Raffler._getNebyooApps = async function () {
  const response = await fetch(NEBYOOAPPS_SOURCE_URL)
  const json = await response.json()
  const apps = json.body
  const appList = document.querySelector('.nav-list')

  Object.values(apps).forEach((app) => {
    const appLink = document.createElement('a')
    appLink.href = app.url
    appLink.innerText = app.title
    appLink.target = '_blank'
    appList.appendChild(appLink)
  })
}

// encode user entries html
Raffler.__sanitize = function (newEntry) {
  Object.values(newEntry).forEach((val) => {
    newEntry.val = val
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/""/g, '&quot;')
  })

  return newEntry
}

// check if User Items are valid before syncing
Raffler.__userItemsAreValid = function (items) {
  let userItems = items.split('\n').filter((item) => item != '')

  if (userItems.length) {
    if (userItems.every((item) => item.split(',').length == 2)) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

Raffler.__shuffleArray = function (array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}
