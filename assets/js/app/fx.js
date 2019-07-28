/* fx */
/* extra fluff to make it cool(er) */
/* global Raffler, talkify */

Raffler._playSound = function (soundId) {
  var sound = document.getElementById(soundId)
  if (sound) {
    Raffler.audioContext.resume().then(() => {
      if (soundId === 'beep' && Raffler.elements.ckOptSoundCountdown.is(':checked')) {
        sound.play()
      }
      if (soundId === 'victory' && Raffler.elements.ckOptSoundVictory.is(':checked')) {
        sound.play()
      }
    })
  } else {
    Raffler._notify('Sound file not found or is invalid', 'error')
  }
}

Raffler._readName = function (itemChosen) {
  if (Raffler.elements.ckOptSoundName.is(':checked')) {
    var player = new talkify.TtsPlayer()
    // var player = new talkify.Html5Player()
    player.setRate(0.9)
    player.playText(`${itemChosen.name} from ${itemChosen.affl}`)
  }
}
