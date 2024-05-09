/* debug */
/* debug functions */
/* global Raffler */

Raffler._initDebug = function () {
  if (Raffler.dom.header.debug.container) {
    // show debug buttons
    Raffler.dom.header.debug.container.style.display = 'flex'

    // make header buttons smaller to fit in debug buttons
    document.querySelectorAll('button.icon').forEach((btn) => {
      btn.style.fontSize = '16px'
    })
  }
}

// modal: debug: display Raffler.config and Raffler.settings
Raffler._debugDisplayAppConfig = function () {
  const config = Raffler.config
  const settings = Raffler.settings

  let html = ''

  html += '<a name="config"></a>'
  html += `<h4>GLOBAL (ENV: ${Raffler.config.env})</h4>`
  html += '<h4>----------------------------</h4>'
  html += '<h5><strong>CONFIG</strong> | <a href="#settings">SETTINGS</a></h5>'
  html += '<h4>----------------------------</h4>'

  html += '<dl>'

  Object.keys(config)
    .sort()
    .forEach((key) => {
      // if value is an object, dig in
      if (typeof config[key] == 'object' && !Array.isArray(config[key]) && config[key] != null) {
        html += `<dd><code>${key}: {</code><dl>`

        Object.keys(config[key]).forEach((k) => {
          var label = k
          var value = config[key][k]

          if (Object.keys(value)) {
            if (key == 'sound') {
              Object.entries(value).forEach((key, val) => {
                Raffler._notify(`key: ${key}, val: ${val}`)
              })
            } else {
              Raffler._notify(`found another object: key: ${key}, label: ${label}, value: ${value}`)
            }
          } else {
            html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
          }
        })

        html += '</dl><code>}</code></dd>'
      } else {
        var label = key
        var value = config[key]

        if (label == 'itemsArr') {
          html += `<dd><code>${label}:</code></dd>`
          html += `<dt>${JSON.stringify(value)}</dt>`
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
        }
      }
    })

  html += '</dl>'

  html += '<h4>----------------------------</h4>'
  html += '<a name="settings"></a>'
  html += '<h5><a href="#config">CONFIG</a> | SETTINGS</h5>'
  html += '<h4>----------------------------</h4>'

  html += '<dl>'

  Object.keys(settings)
    .sort()
    .forEach((key) => {
      // if value is an object, dig in
      if (
        typeof settings[key] == 'object' &&
        !Array.isArray(config[key]) &&
        settings[key] != null
      ) {
        html += `<dd><code>${key}: {</code><dl>`

        Object.keys(settings[key]).forEach((k) => {
          var label = k
          var value = settings[key][k]

          if (Object.keys(value)) {
            if (key == 'sound') {
              Object.entries(value).forEach((key, val) => {
                Raffler._notify(`key: ${key}, val: ${val}`)
              })
            } else {
              Raffler._notify(`found another object: key: ${key}, label: ${label}, value: ${value}`)
            }
          } else {
            html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
          }
        })

        html += '</dl><code>}</code></dd>'
      } else {
        var label = key
        var value = settings[key]

        html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
      }
    })

  html += '</dl>'

  return html
}

// update debug items graph with current cycle information
Raffler._debugUpdateItemsGraph = function () {
  let index = 0

  Raffler.dom.debug.itemsGraph.innerHTML = ''

  Raffler.config.itemsArr.forEach(function () {
    const bar = document.createElement('span')
    bar.id = index++

    Raffler.dom.debug.itemsGraph.appendChild(bar)
  })
}

// update debug settings interval range and multiple value
Raffler._debugRefreshValues = function () {
  Raffler.dom.settings.debug.intervalValue.value = Raffler.config.intervalRange
  Raffler.dom.settings.debug.multiplyValue.innerText = Raffler.config.multiplyValue
}

Raffler.__debugDisableTimerStart = function () {
  Raffler.dom.settings.debug.btnTimerStart.setAttribute('disabled', true)
  Raffler.dom.settings.debug.btnTimerStart.classList.add('disabled')
}
Raffler.__debugEnableTimerStart = function () {
  Raffler.dom.settings.debug.btnTimerStart.removeAttribute('disabled')
  Raffler.dom.settings.debug.btnTimerStart.classList.remove('disabled')
}
Raffler.__debugDisableTimerStop = function () {
  Raffler.dom.settings.debug.btnTimerStop.setAttribute('disabled', true)
  Raffler.dom.settings.debug.btnTimerStop.classList.add('disabled')
}
Raffler.__debugEnableTimerStop = function () {
  Raffler.dom.settings.debug.btnTimerStop.removeAttribute('disabled')
  Raffler.dom.settings.debug.btnTimerStop.classList.remove('disabled')
}

Raffler.__debugToggleTestVisualNotices = function () {
  const btns = Raffler.dom.settings.debug.btnTestVisual

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
