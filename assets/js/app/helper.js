/* helper */
/* methods to do little utility things */
/* global $, Raffler */

Raffler._disableRaffle = function () {
  Raffler.elements.body.removeClass()
  Raffler.elements.btnRaffle.prop('disabled', true)
  Raffler.elements.btnRaffle.addClass('disabled')
}
Raffler._enableRaffle = function () {
  Raffler.elements.btnRaffle.removeClass('disabled')
  Raffler.elements.btnRaffle.prop('disabled', false)
}
Raffler._disableTimerStart = function () {
  Raffler.elements.btnTimerStart.prop('disabled', true)
  Raffler.elements.btnTimerStart.addClass('disabled')
}
Raffler._enableTimerStart = function () {
  Raffler.elements.btnTimerStart.prop('disabled', false)
  Raffler.elements.btnTimerStart.removeClass('disabled')
}
Raffler._disableTimerStop = function () {
  Raffler.elements.btnTimerStop.prop('disabled', true)
  Raffler.elements.btnTimerStop.addClass('disabled')
}
Raffler._enableTimerStop = function () {
  Raffler.elements.btnTimerStop.prop('disabled', false)
  Raffler.elements.btnTimerStop.removeClass('disabled')
}
Raffler._disableChosenConfirm = function () {
  Raffler.elements.chosenConfirm.hide()
  Raffler.elements.btnChosenConfirmYes.addClass('disabled')
  Raffler.elements.btnChosenConfirmNo.addClass('disabled')
  Raffler.elements.btnChosenConfirmYes.prop('disabled', true)
  Raffler.elements.btnChosenConfirmNo.prop('disabled', true)
  Raffler._enableTimerStop()
}
Raffler._enableChosenConfirm = function () {
  Raffler.elements.chosenConfirm.show()
  Raffler.elements.btnChosenConfirmYes.removeClass('disabled')
  Raffler.elements.btnChosenConfirmNo.removeClass('disabled')
  Raffler.elements.btnChosenConfirmYes.prop('disabled', false)
  Raffler.elements.btnChosenConfirmNo.prop('disabled', false)
  Raffler._disableTimerStart()
  Raffler._disableTimerStop()
}
// encode user entries html
Raffler._sanitize = function (newEntry) {
  $.each(newEntry, function (key, val) {
    newEntry.val = val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/""/g, '&quot;')
  })
  return newEntry
}
// check for duplicate user entries
Raffler._isDuplicateValue = function (newUserItem) {
  var currentUserItems = Raffler._getLocalStorageItem('rafflerUserItems')

  $.each(currentUserItems, function (key, val) {
    if (newUserItem.name === val.name && newUserItem.affl === val.affl) {
      return true
    }
  })

  return false
}
// shuffle array
Raffler._shuffleArray = function (array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}
// localStorage getter/setter
Raffler._getLocalStorageItem = function (lsKey) {
  try {
    return JSON.parse(window.localStorage.getItem(lsKey))
  } catch (e) {
    console.error('_getLocalStorageItem: ' + e)
    return false
  }
}
Raffler._setLocalStorageItem = function (lsKey, obj) {
  try {
    window.localStorage.setItem(lsKey, JSON.stringify(obj))
  } catch (e) {
    console.error('_setLocalStorageItem: ' + e)
    return false
  }
}
// app notifications
Raffler._notify = function (msg, type, notifyUser) {
  if (Raffler.options.notifierEnabled) {
    type = (typeof type) === 'undefined' ? '' : type
    notifyUser = (typeof notifyUser) === 'undefined' ? '' : notifyUser

    var bgColor, fgColor, header, icon
    var speed = 1500

    switch (type) {
    case 'success':
      bgColor = '#99c24d'
      fgColor = '#000000'
      header = 'Success'
      speed = 4000
      icon = 'fa-smile'
      break
    case 'warning' || 'warn':
      bgColor = '#fadf63'
      fgColor = '#000000'
      header = 'Warning'
      speed = 6000
      icon = 'fa-exclamation-triangle'
      break
    case 'error' || 'err':
      bgColor = '#632b30'
      fgColor = '#ffffff'
      header = 'Error'
      speed = 0
      icon = 'fa-times-circle'
      break
    default:
      bgColor = '#006e90'
      fgColor = '#ffffff'
      header = 'Notice'
      speed = 4000
      icon = 'fa-info-circle'
      break
    }

    var label = function (raw) {
      var [bgColor, fgColor, type, ...msg] = raw.split(' ')
      return [
        `%c${type}%c ${msg.join(' ')}`,
        `background-color: ${bgColor}; border-right: 3px solid #000; color: ${fgColor}; padding: 0.15em 0.35em 0.15em 0.5em`,
        ''
      ]
    }

    // 1. notify admin
    console.log.apply(console, label(`${bgColor} ${fgColor} ${header.toUpperCase()} ${msg}`))

    // 2. also, optionally, notify user
    if (notifyUser) {
      var d = document.createElement('div')
      $(d).addClass('item-status')
        .css({
          'background-color': bgColor,
          'color': fgColor
        })
        .html(`<i class='fas ${icon}'></i> <strong>${header}</strong>: ${msg}`)
        .prependTo('.main-container')
        .click(function () {
          $(this).remove()
        })

      if (speed > 0) {
        $(d).hide()
          .fadeToggle(500)
          .delay(speed)
          .fadeToggle(200)
          .queue(function () {
            $(this).remove()
          })
      } else {
        $(d).hide().fadeToggle(500)
      }
    }
  }
}
