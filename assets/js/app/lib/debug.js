/* debug */
/* debug functions */
/* global Raffler */

Raffler.__debugDisableTimerStart = function() {
  Raffler.dom.debug.btnTimerStart.setAttribute('disabled', true)
  Raffler.dom.debug.btnTimerStart.classList.add('disabled')
}
Raffler.__debugEnableTimerStart = function() {
  Raffler.dom.debug.btnTimerStart.removeAttribute('disabled')
  Raffler.dom.debug.btnTimerStart.classList.remove('disabled')
}
Raffler.__debugDisableTimerStop = function() {
  Raffler.dom.debug.btnTimerStop.setAttribute('disabled', true)
  Raffler.dom.debug.btnTimerStop.classList.add('disabled')
}
Raffler.__debugEnableTimerStop = function() {
  Raffler.dom.debug.btnTimerStop.removeAttribute('disabled')
  Raffler.dom.debug.btnTimerStop.classList.remove('disabled')
}

Raffler.__debugToggleTestVisualNotices = function() {
  const btns = Raffler.dom.debug.btnTestVisual

  Object.keys(btns).forEach((key) => {
    if (!Raffler.settings.allowVisualNotifications) {
      btns[key].setAttribute('disabled', true)
      btns[key].setAttribute('title', 'Raffler.settings.allowVisualNotifications is false')
      btns[key].classList.add('disabled')
    } else {
      btns[key].removeAttribute('disabled')
      btns[key].setAttribute('title', '')
      btns[key].classList.remove('disabled')
    }
  })
}
