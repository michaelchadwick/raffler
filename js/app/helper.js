/* helper */
/* methods to do little utility things */

Raffler._disableRaffle = function () {
  Raffler.body.removeClass()
  Raffler.btnRaffle.addClass('disabled')
  Raffler.btnTimerStart.removeClass('disabled')
  Raffler.btnTimerStop.removeClass('disabled')
  Raffler.btnRaffle.prop('disabled', true)
  Raffler.btnTimerStart.prop('disabled', false)
  Raffler.btnTimerStop.prop('disabled', false)
}
Raffler._enableRaffle = function () {
  Raffler.btnRaffle.removeClass('disabled')
  Raffler.btnTimerStart.addClass('disabled')
  Raffler.btnTimerStop.addClass('disabled')
  Raffler.btnRaffle.prop('disabled', false)
  Raffler.btnTimerStart.prop('disabled', true)
  Raffler.btnTimerStop.prop('disabled', true)
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
      speed = 1500
      break
    case 'warning' || 'warn':
      bgColor = '#c1bf24'
      fgColor = '#000000'
      header = 'Warning'
      speed = 3000
      break
    case 'error' || 'err':
      bgColor = '#880000'
      fgColor = '#ffffff'
      header = 'Error'
      speed = 5000
      break
    default:
      bgColor = '#e6e1d0'
      fgColor = '#000000'
      header = 'Notice'
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
        'color': fgColor,
        'cursor': 'pointer'
      })
      .html('<strong>' + header + '</strong>: ' + msg)
      .prependTo('.main-container')
      .click(function () {
        $(this).remove()
      })
      .hide()
      .toggle(200)
      .delay(speed)
      .toggle(200)
      .queue(function () {
        $(this).remove()
      })
  }
}
