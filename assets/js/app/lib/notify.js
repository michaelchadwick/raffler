/* notify */
/* custom console.log messages */
/* global Raffler */

Raffler._notify = function(msg, type, notifyVisually, line) {
  type = (typeof type) === 'undefined' ? '' : type
  notifyVisually = (typeof notifyVisually) === 'undefined' ? '' : notifyVisually

  let bgcolor, fgcolor, header, icon

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

  const label = function(raw) {
    var [bgcolor, fgcolor, type, ...msg] = raw.split(' ')
    return [
      `%c${type}%c ${msg.join(' ')}`,
      `background-color: ${bgcolor}; border-right: 3px solid #000; color: ${fgcolor}; padding: 0.15em 0.35em 0.15em 0.5em`,
      ''
    ]
  }

  // 1. notify admin
  if (Raffler.settings.allowDebugNotifications) {
    console.log.apply(console, label(`${bgcolor} ${fgcolor} ${header.toUpperCase()} ${msg} ${line ? `(${line})` : ''}`))
  }

  // 2. also, optionally, notify user visually if allowed and specified
  if (Raffler.settings.allowVisualNotifications && notifyVisually) {
    const wrapper = document.createElement('div')
    wrapper.classList.add('item-status-wrapper')

    const notification = document.createElement('div')

      notification.classList.add('item-status')
      notification.style.backgroundColor = bgcolor
      notification.style.color = fgcolor

      notification.innerHTML  = `
        <div class="item-status-type">
          <i class='fas ${icon}'></i>
          <span>${header}:</span>
        </div>
        <div class="item-status-msg">${msg}</div>
      `

      notification.onclick = function() {
        this.parentNode.removeChild(this)
      }

    wrapper.appendChild(notification)

    const mainContainer = document.querySelector('.main-container')

    mainContainer.prepend(wrapper)
  }
}