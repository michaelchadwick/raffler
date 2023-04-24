/* talkify */
/* talkify configuration */
/* global Raffler, talkify */

Raffler._initTalkifyConfig = function() {
  talkify.config.debug = false
  talkify.config.remoteService.enabled = false
  talkify.config.remoteService.host = 'https://talkify.net'
  talkify.config.remoteService.apiKey = Raffler.config.talkifyKey
  talkify.config.ui.audioControls = {
    enabled: false,
    container: document.getElementById('#talkify-audio')
  }
}

if (Raffler.config.talkifyKey === null || Raffler.config.talkifyKey === '') {
  console.warn('Talkify: could not find API key')

  // Raffler.dom.admin.ckOptSoundName.attr('disabled', true)
  // Raffler.dom.admin.ckOptSoundName.attr('title', 'Currently disabled as no valid Talkify API Key was found')
  // Raffler.dom.admin.ckOptSoundNameLabel.attr('title', 'Currently disabled as no valid Talkify API Key was found')
} else {
  console.log('Talkify: found API key, so setting config')

  Raffler._initTalkifyConfig()
}
