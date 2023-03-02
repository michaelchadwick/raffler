/* export */
/* export value in results list to text using FileSaver */
/* global Raffler */

Raffler._exportResults = function() {
  Raffler._notify('exporting results', 'notice')

  let plainText = document.querySelector('div#results-wrapper div ul').innerHTML

  // plainText.innerHTML = ''
  plainText = plainText.replaceAll(/<li>/g, '')
  plainText = plainText.replaceAll(/<\/li>/g, '\r\n')

  const today = new Date()

  const yr = today.getFullYear()

  let mo = today.getMonth() + 1
  mo = (mo < 10) ? `0${mo}` : `${mo}`

  let dy = today.getDate()
  dy = (dy < 10) ? `0${dy}` : `${dy}`

  const ymd = `${yr}${mo}${dy}`

  let hr = today.getHours()
  hr = (hr < 10) ? `0${hr}` : `${hr}`

  let mi = today.getMinutes()
  mi = (mi < 10) ? `0${mi}` : `${mi}`

  let sc = today.getSeconds()
  sc = (sc < 10) ? `0${sc}` : `${sc}`

  const hms = hr + ':' + mi + ':' + sc

  const filename = `raffler-export_${ymd}-${hms}.txt`
  const blob = new Blob(
    [plainText],
    {type: 'text/plain;charset=' + document.characterSet}
  )

  saveAs(blob, filename)
}
