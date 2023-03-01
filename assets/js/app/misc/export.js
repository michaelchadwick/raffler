/* export */
/* export value in results list to text using FileSaver */
/* global Raffler */

Raffler._exportResults = function() {
  Raffler._notify('exporting results', 'notice')

  const plainText = $('div#results-wrapper div ul')
    .html()
    .replace(/<li>/g, '')
    .replace(/<\/li>/g, '\r\n')

  var today = new Date()

  var yr = today.getFullYear()
  var mo = today.getMonth() + 1
  mo = (mo < 10) ? `0${mo}` : `${mo}`
  var dy = today.getDate()
  dy = (dy < 10) ? `0${dy}` : `${dy}`
  var ymd = `${yr}${mo}${dy}`

  var hr = today.getHours()
  hr = (hr < 10) ? `0${hr}` : `${hr}`
  var mi = today.getMinutes()
  mi = (mi < 10) ? `0${mi}` : `${mi}`
  var sc = today.getSeconds()
  sc = (sc < 10) ? `0${sc}` : `${sc}`
  var hms = hr + ':' + mi + ':' + sc

  var filename = `raffler-export_${ymd}_${hms}.txt`
  var blob = new Blob(
    [plainText],
    {type: 'text/plain;charset=' + document.characterSet}
  )

  saveAs(blob, filename)
}
