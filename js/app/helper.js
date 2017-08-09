/* helper */
/* methods to do little utility things */
/* global $, Raffler */

Raffler._disableRaffle = function () {
  Raffler.body.removeClass()
  Raffler.btnRaffle.prop('disabled', true)
  Raffler.btnRaffle.addClass('disabled')
}
Raffler._enableRaffle = function () {
  Raffler.btnRaffle.removeClass('disabled')
  Raffler.btnRaffle.prop('disabled', false)
}
Raffler._disableTimerStart = function () {
  Raffler.btnTimerStart.prop('disabled', true)
  Raffler.btnTimerStart.addClass('disabled')
}
Raffler._enableTimerStart = function () {
  Raffler.btnTimerStart.prop('disabled', false)
  Raffler.btnTimerStart.removeClass('disabled')
}
Raffler._disableTimerStop = function () {
  Raffler.btnTimerStop.prop('disabled', true)
  Raffler.btnTimerStop.addClass('disabled')
}
Raffler._enableTimerStop = function () {
  Raffler.btnTimerStop.prop('disabled', false)
  Raffler.btnTimerStop.removeClass('disabled')
}
Raffler._disableChosenConfirm = function () {
  Raffler.divChosenConfirm.hide()
  Raffler.btnChosenConfirmYes.addClass('disabled')
  Raffler.btnChosenConfirmNo.addClass('disabled')
  Raffler.btnChosenConfirmYes.prop('disabled', true)
  Raffler.btnChosenConfirmNo.prop('disabled', true)
  Raffler._enableTimerStop()
}
Raffler._enableChosenConfirm = function () {
  Raffler.divChosenConfirm.show()
  Raffler.btnChosenConfirmYes.removeClass('disabled')
  Raffler.btnChosenConfirmNo.removeClass('disabled')
  Raffler.btnChosenConfirmYes.prop('disabled', false)
  Raffler.btnChosenConfirmNo.prop('disabled', false)
  Raffler._disableTimerStart()
  Raffler._disableTimerStop()
}
// encode user entries html
Raffler._sanitize = function (s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/""/g, '&quot;')
}
// check for duplicate user entries
Raffler._isDuplicateValue = function (newUserItem) {
  var currentUserItems = Raffler._getLocalStorageItem('rafflerUserItems')

  $.each(currentUserItems.items, function (key, val) {
    if (newUserItem === val) return true
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
Raffler._notify = function (msg, type = '', notifyUser = false) {
  var bgColor, fgColor, header
  var speed = 1500

  switch (type) {
    case 'success':
      bgColor = '#4c8504'
      fgColor = '#ffffff'
      header = 'Success'
      speed = 4000
      break
    case 'warning' || 'warn':
      bgColor = '#c1bf24'
      fgColor = '#000000'
      header = 'Warning'
      speed = 6000
      break
    case 'error' || 'err':
      bgColor = '#880000'
      fgColor = '#ffffff'
      header = 'Error'
      speed = 0
      break
    default:
      bgColor = '#e6e1d0'
      fgColor = '#000000'
      header = 'Notice'
      speed = 4000
      break
  }

  const label = function (raw) {
    const [bgColor, fgColor, type, ...msg] = raw.split(' ')
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
      .html('<strong>' + header + '</strong>: ' + msg)
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
      $(d).hide()
          .fadeToggle(500)
    }
  }
}
