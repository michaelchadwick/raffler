/* fx */
/* extra fluff to make it cool(er) */
/* global Raffler */

Raffler._playSound = function (soundId) {
  var sound = document.getElementById(soundId)
  if (sound) {
    if (soundId === 'beep' && Raffler.ckOptSoundCountdown.is(':checked')) {
      sound.play()
    }
    if (soundId === 'victory' && Raffler.ckOptSoundVictory.is(':checked')) {
      sound.play()
    }
  } else {
    Raffler._notify('Sound file not found or is invalid', 'warning')
  }
  if (Raffler.ignoreSound) Raffler.ignoreSound = false
}
