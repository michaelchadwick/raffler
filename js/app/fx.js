/* fx */
/* extra fluff to make it look and sound cool */
/* global Raffler */

Raffler._hideFireworks = function () {
  Raffler.divMainWrapper.prop('z-index', 0)
  Raffler.divItemsCycle.prop('z-index', 0)
  Raffler.btnRaffle.prop('z-index', 0)
  Raffler.canvasFireworks.hide()
}
Raffler._displayFireworks = function () {
  if (Raffler.ckOptFireworks.is(':checked')) {
    Raffler.divItemsCycle.prop('z-index', 1000)
    Raffler.btnRaffle.prop('z-index', 1000)
    Raffler.canvasFireworks.prop('z-index', 1001)
    Raffler.canvasFireworks.show()
  }
}
Raffler._playSound = function (soundId) {
  var sound = document.getElementById(soundId)
  if (sound) {
    if (soundId === 'beep' && Raffler.ckOptSoundCountdown.is(':checked')) {
      sound.play()
    }
    if (soundId === 'victory' && Raffler.ckOptSoundWinner.is(':checked')) {
      sound.play()
    }
  } else {
    Raffler._notify('Sound file not found or is invalid', 'warning')
  }
  if (Raffler.ignoreSound) Raffler.ignoreSound = false
}
