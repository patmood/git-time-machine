(function() {
  // Create link
  var link = document.createElement('a')
  var t = document.createTextNode('Time Machine')
  link.appendChild(t)
  link.className = 'minibutton'
  link.id = 'time-machine'
  link.target = '_blank'

  // Galaxy background
  var imgURL = chrome.extension.getURL("galaxy_button.png")
  link.style.backgroundImage="url('" + imgURL + "')"

  // Get url
  var pattern = /^\/(\w+)\/(\w+)\/blob\/(\w+)\/(.+)$/i
    , reg = new RegExp(pattern)
    , match = window.location.pathname.match(reg)

  var username = match[1]
    , repo = match[2]
    , sha = match[3]
    , path = match[4]

  link.href = 'http://localhost:9999/repos/'
             + username
             + '/'
             + repo
             + '/commits/'
             + sha
             + '?path='
             + path

  // Add to page
  document.querySelectorAll('.file-box .actions .button-group')[0].appendChild(link)

})()
