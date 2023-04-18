/* audio */
/* sounds and name reading */
/* global Raffler, talkify */

const RAFFLER_CACHE_AUDIO_KEY = 'raffler-cache-audio'
const RAFFLER_ASSET_DATA_PATH = '/assets/audio'

// Try to get data from the cache, but fall back to fetching it live.
async function getData(cacheName, url) {
  let cachedData = await getCachedData(cacheName, url);

  if (cachedData) {
    // console.log('Retrieved cached data', cachedData);
    return cachedData;
  }

  // console.log('Fetching fresh data');

  const cacheStorage = await caches.open(cacheName);
  await cacheStorage.add(url);
  cachedData = await getCachedData(cacheName, url);
  await deleteOldCaches(cacheName);

  return cachedData;
}

// Get data from the cache.
async function getCachedData(cacheName, url) {
  const cacheStorage = await caches.open(cacheName);
  const cachedResponse = await cacheStorage.match(url);

  if (!cachedResponse || !cachedResponse.ok) {
    return false;
  }

  return await cachedResponse.arrayBuffer();
}

// Delete any old caches to respect user's disk space.
async function deleteOldCaches(currentCache) {
  const keys = await caches.keys();

  for (const key of keys) {
    const isOurCache = RAFFLER_CACHE_AUDIO_KEY;

    if (currentCache === key || !isOurCache) {
      continue;
    }

    caches.delete(key);
  }
}

// use CacheStorage to check cache
async function useCache(url) {
  const context = new AudioContext();
  const gainNode = context.createGain();
  const source = context.createBufferSource();

  try {
    const audioBuffer = await getData(RAFFLER_CACHE_AUDIO_KEY, url)

    gainNode.gain.value = 0.3;
    source.buffer = await context.decodeAudioData(audioBuffer);

    source.connect(gainNode);
    gainNode.connect(context.destination);

    source.start();
  } catch (error) {
    console.error(error)
  }
}

// use direct fetch(url)
async function useFetch(url) {
  const context = new AudioContext();
  const gainNode = context.createGain();
  const source = context.createBufferSource();

  const audioBuffer = await fetch(url)
    .then(response => response.arrayBuffer())
    .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer));

    gainNode.gain.value = 0.3;
    source.buffer = audioBuffer;

    source.connect(gainNode);
    gainNode.connect(context.destination);

    source.start();
}

Raffler._initData = async function() {
  const path = RAFFLER_ASSET_DATA_PATH

  await caches.open(RAFFLER_CACHE_AUDIO_KEY).then(cache => {
    cache.keys().then(function(keys) {
      if (!keys.length) {
        // console.info(`${RAFFLER_CACHE_AUDIO_KEY} is empty. Adding files to it...`)

        cache.addAll([
          `${path}/countdown.mp3`,
          `${path}/victory.mp3`
        ])
      } else {
        // console.info(`${RAFFLER_CACHE_AUDIO_KEY} is full, so need to initialize.`)
      }
    })
  })
}

Raffler._audioPlay = async function(soundId) {
  const path = RAFFLER_ASSET_DATA_PATH;
  const format = 'mp3';
  const url = `${path}/${soundId}.${format}`

  switch (soundId) {
    case 'countdown':
      if (Raffler.settings.sound.countdown) {
        if ('caches' in self) {
          useCache(url)
        } else {
          useFetch(url)
        }
      }
      break

    case 'victory':
      if(Raffler.settings.sound.victory) {
        if ('caches' in self) {
          useCache(url)
        } else {
          useFetch(url)
        }
      }
      break
  }
};

// talkify: read name on choice
Raffler._readName = function (itemChosen) {
  if (Raffler.settings.sound.name) {
    const player = new talkify.TtsPlayer()
    // const player = new talkify.Html5Player()

    player.setRate(0.9)
    player.playText(`${itemChosen.name} from ${itemChosen.affl}`)
  }
}
