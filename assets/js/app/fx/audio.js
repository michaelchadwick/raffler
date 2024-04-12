/* audio worker */
/* sounds and name reading */
/* global Raffler, talkify */

const RAFFLER_CACHE_AUDIO_KEY = 'raffler-cache-audio'
const RAFFLER_ASSET_DATA_PATH = '/assets/audio'

// Try to get data from the cache, but fall back to fetching it live.
async function getData(cacheName, url) {
  let cachedData = await getCachedData(cacheName, url)

  if (cachedData) {
    // console.log('Retrieved cached data', cachedData)
    return cachedData
  }

  // console.log('Fetching fresh data')

  const cacheStorage = await caches.open(cacheName)
  await cacheStorage.add(url)
  cachedData = await getCachedData(cacheName, url)
  await deleteOldCaches(cacheName)

  return cachedData
}

// Get data from the cache.
async function getCachedData(cacheName, url) {
  const cacheStorage = await caches.open(cacheName)
  const cachedResponse = await cacheStorage.match(url)

  if (!cachedResponse || !cachedResponse.ok) {
    return false
  }

  return await cachedResponse.arrayBuffer()
}

// Delete any old caches to respect user's disk space.
async function deleteOldCaches(currentCache) {
  const keys = await caches.keys()

  for (const key of keys) {
    const isOurCache = RAFFLER_CACHE_AUDIO_KEY

    if (currentCache === key || !isOurCache) {
      continue
    }

    caches.delete(key)
  }
}

// Use CacheStorage to check cache.
async function playFromCache(url) {
  Raffler._notify(`playFromCache(${url})`)

  const context = new AudioContext()
  const gainNode = context.createGain()
  const source = context.createBufferSource()

  // WIP: AudioWorklet
  // await context.audioWorklet.addModule('/assets/js/app/fx/audio-processor.js')
  // const audioProcNode = new AudioWorkletNode(context, 'audio-processor')

  // audioProcNode.addEventListener('processorerror', (event) => {
    // console.error(`playFromCache(${url}) processor error from audioNode`, event)
  // })

  context.onstatechange = () => {
    console.log('playFromCache AudioContext changed', context.state)
  }

  source.onended = function() {
    Raffler._notify(`playFromCache(${url}) source ended`)
    Raffler._currentAudioPlaying = null

    // context.suspend()
    // console.log('context suspended', context)
  }

  try {
    const audioBuffer = await getData(RAFFLER_CACHE_AUDIO_KEY, url)

    if (audioBuffer) {
      gainNode.gain.value = 0.3
      source.buffer = await context.decodeAudioData(audioBuffer)

      source
        .connect(gainNode)
        // .connect(audioProcNode)
        .connect(context.destination)

      source.start()

      Raffler._notify(`playFromCache(${url}) source started`)
    }
  } catch (error) {
    Raffler._notify(`playFromCache(${url}) failed to play audioBuffer: ${error}`, 'error')
  }
}

// Use direct fetch(url).
async function playFromFetch(url) {
  Raffler._notify(`playFromFetch(${url})`)

  const context = new AudioContext()
  const gainNode = context.createGain()
  const source = context.createBufferSource()

  // WIP: AudioWorklet
  // await context.audioWorklet.addModule('/assets/js/app/fx/audio-processor.js')
  // const audioProcNode = new AudioWorkletNode(context, 'audio-processor')

  // audioProcNode.addEventListener('processorerror', (event) => {
    // console.error(`playFromFetch(${url}) processor error from audioProcNode`, event)
  // })

  context.onstatechange = () => {
    console.log('playFromFetch AudioContext changed', context.state)
  }

  source.onended = function() {
    Raffler._notify(`playFromFetch(${url}) source ended`)
    Raffler._currentAudioPlaying = null

    // context.suspend()
    // console.log('context suspended', context)
  }

  try {
    const audioBuffer = await fetch(url)
      .then(response => response.arrayBuffer())
      .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer))

    if (audioBuffer) {
      gainNode.gain.value = 0.3
      source.buffer = audioBuffer

      source
        .connect(gainNode)
        // .connect(audioProcNode)
        .connect(context.destination)

      source.start()

      Raffler._notify(`playFromFetch(${url}) source started`)
    }
  } catch {
    Raffler._notify(`playFromFetch(${url}) failed to play audioBuffer: ${error}`, 'error')
  }
}

// Add audio assets into cache.
Raffler._initData = async function() {
  const path = RAFFLER_ASSET_DATA_PATH

  await caches.open(RAFFLER_CACHE_AUDIO_KEY).then(cache => {
    cache.keys().then(function(keys) {
      if (!keys.length) {
        // console.info(`${RAFFLER_CACHE_AUDIO_KEY} is empty. Adding files to it...`)

        cache.addAll([
          `${path}/countdown.mp3`,
          `${path}/countdown.wav`,
          `${path}/victory.mp3`,
          `${path}/victory.wav`
        ])
      } else {
        // console.info(`${RAFFLER_CACHE_AUDIO_KEY} is full, so need to initialize.`)
      }
    })
  })
}

// Play audio file by soundId, using cache or fetch to access it.
Raffler._playAudio = async function(soundId, format = 'wav') {
  const path = RAFFLER_ASSET_DATA_PATH
  const url = `${path}/${soundId}.${format}`

  if ('caches' in self) {
    await playFromCache(url)
  } else {
    await playFromFetch(url)
  }
}

// talkify: read name on choice
Raffler._readName = function(itemChosen) {
  const player = new talkify.TtsPlayer()
  // const player = new talkify.Html5Player()

  player.setRate(0.9)

  if (typeof itemChosen == 'object') {
    player.playText(`${itemChosen.name} from ${itemChosen.affl}`)
  } else {
    player.playText(itemChosen)
  }
}

// receive message from main thread if used as Web Worker
// onmessage = function(msg) {
//   console.log('received msg from main js', msg.data)

//   if (msg.isTrusted) {
//     const command = msg.data.command
//     const data = msg.data.data

//     console.log('Message received from main script:', command)

//     switch (command) {
//       case 'initData':
//         this._initData()
//         break

//       case 'playAudio':
//         this._playAudio(data)
//         break

//       case 'readName':
//         this._readName(data)
//         break
//     }
//   } else {
//     console.error('untrusted message posted to Web Worker!', msg)
//   }
// }
