/* talkify */
/* talkify configuration */
/* global Raffler */

talkify.config.debug = false
talkify.config.remoteService.enabled = false
talkify.config.remoteService.host = 'https://talkify.net'
talkify.config.remoteService.apiKey = Raffler.settings.talkifyKey
talkify.config.ui.audioControls = {
  enabled: false,
  container: document.getElementById('#talkify-audio')
}

if (Raffler.settings.talkifyKey === null || Raffler.settings.talkifyKey === '') {
  // Raffler.dom.admin.ckOptSoundName.attr('disabled', true)
  // Raffler.dom.admin.ckOptSoundName.attr('title', 'Currently disabled as no valid Talkify API Key was found')
  // Raffler.dom.admin.ckOptSoundNameLabel.attr('title', 'Currently disabled as no valid Talkify API Key was found')
}
