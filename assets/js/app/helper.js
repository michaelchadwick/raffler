/* helper */
/* methods to do little utility things */
/* global $, Raffler */

// jQuery extension to parse url querystring
$.QueryString = (function (a) {
  if (a === '') return {}
  var b = {}
  for (var i = 0; i < a.length; ++i) {
    var p = a[i].split('=', 2)
    if (p.length !== 2) {
      continue
    }
    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '))
  }
  return b
})(window.location.search.substr(1).split('&'))


Raffler._initCycleText = function () {
  Raffler.dom.itemsCycle.html('<section id="init-raffler-cycle"><a href="#">BEGIN RAFFLE!</a></section>')
  Raffler._disableRaffle()
}
Raffler._disableRaffle = function () {
  Raffler.dom.body.removeClass()
  Raffler.dom.interactive.btnRaffle.prop('disabled', true).addClass('disabled')
}
Raffler._enableRaffle = function () {
  Raffler.dom.interactive.btnRaffle.prop('disabled', false).removeClass('disabled')
}
Raffler._toggleTestNotices = function () {
  var btns = Raffler.dom.interactive.btnTests
  $.each(btns, function (key) {
    if (!Raffler.options.notifierEnabled) {
      $(btns[key]).attr('disabled', true)
      $(btns[key]).attr('title', 'Raffler.options.notifierEnabled is false')
      $(btns[key]).addClass('disabled')
    } else {
      $(btns[key]).attr('disabled')
      $(btns[key]).attr('title', '')
      $(btns[key]).removeClass('disabled')
    }
  })
}
Raffler._disableTimerStart = function () {
  Raffler.dom.admin.btnTimerStart.prop('disabled', true).addClass('disabled')
}
Raffler._enableTimerStart = function () {
  Raffler.dom.admin.btnTimerStart.prop('disabled', false).removeClass('disabled')
}
Raffler._disableTimerStop = function () {
  Raffler.dom.admin.btnTimerStop.prop('disabled', true).addClass('disabled')
}
Raffler._enableTimerStop = function () {
  Raffler.dom.admin.btnTimerStop.prop('disabled', false).removeClass('disabled')
}
Raffler._disableChosenConfirm = function () {
  Raffler.dom.chosenConfirm.hide()
  Raffler.dom.interactive.btnChosenConfirmYes.prop('disabled', true).addClass('disabled')
  Raffler.dom.interactive.btnChosenConfirmNo.prop('disabled', true).addClass('disabled')
  Raffler._enableTimerStop()
}
Raffler._enableChosenConfirm = function () {
  Raffler.dom.chosenConfirm.show()
  Raffler.dom.interactive.btnChosenConfirmYes.prop('disabled', false).removeClass('disabled')
  Raffler.dom.interactive.btnChosenConfirmNo.prop('disabled', false).removeClass('disabled')
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
  $.each(Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY), function (key, val) {
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

    var bgcolor, fgcolor, header, icon
    var speed = 1500

    switch (type) {
    case 'success':
      bgcolor = '#99c24d'
      fgcolor = '#000000'
      header = 'Success'
      speed = 4000
      icon = 'fa-smile'
      break
    case 'warning' || 'warn':
      bgcolor = '#fadf63'
      fgcolor = '#000000'
      header = 'Warning'
      speed = 6000
      icon = 'fa-exclamation-triangle'
      break
    case 'error' || 'err':
      bgcolor = '#632b30'
      fgcolor = '#ffffff'
      header = 'Error'
      speed = 0
      icon = 'fa-times-circle'
      break
    default:
      bgcolor = '#006e90'
      fgcolor = '#ffffff'
      header = 'Notice'
      speed = 4000
      icon = 'fa-info-circle'
      break
    }

    var label = function (raw) {
      var [bgcolor, fgcolor, type, ...msg] = raw.split(' ')
      return [
        `%c${type}%c ${msg.join(' ')}`,
        `background-color: ${bgcolor}; border-right: 3px solid #000; color: ${fgcolor}; padding: 0.15em 0.35em 0.15em 0.5em`,
        ''
      ]
    }

    // 1. notify admin
    console.log.apply(console, label(`${bgcolor} ${fgcolor} ${header.toUpperCase()} ${msg}`))

    // 2. also, optionally, notify user
    if (notifyUser) {
      var d = document.createElement('div')
      $(d).addClass('item-status')
        .css({
          'background-color': bgcolor,
          'color': fgcolor
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
