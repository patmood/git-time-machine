var timeout, addButton

function listener() {
  // Return if button already inserted
  if (document.getElementById('time-machine')) return;
  addButton()
}

document.addEventListener("DOMSubtreeModified", function() {
  if(timeout) clearTimeout(timeout)
  timeout = setTimeout(listener, 500)
}, false)

var addButton = function() {
  var buttonGroup = document.querySelectorAll('.file-box .actions .button-group')

  // Return if no buttons on page
  if (buttonGroup.length === 0) return;

  // Get details from url
  var pattern = /^\/(\w+)\/(\w+)\/blob\/(\w+)\/(.+)$/i
    , reg = new RegExp(pattern)
    , match = window.location.pathname.match(reg)

  // Return if no url match
  if (!match) return;

  var username = match[1]
    , repo = match[2]
    , sha = match[3]
    , path = match[4]

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

  // Link to Time Machine page
  // TODO: Match github's url structure exactly so it can link to 'mydomain.com' + window.location.pathname
  link.href = 'http://localhost:9999/repos/'
             + username
             + '/'
             + repo
             + '/commits/'
             + sha
             + '?path='
             + path

  // Add to page
  buttonGroup[0].appendChild(link)

}
