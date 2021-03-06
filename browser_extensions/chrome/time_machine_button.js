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
  var buttonGroup = document.querySelectorAll('.file-actions .btn-group')

  // Return if no buttons on page
  if (buttonGroup.length === 0) return;

  // Get details from url
  var pattern = /^\/(.+)\/(.+)\/blob\/(.+)\/(.+)$/i
    , reg = new RegExp(pattern)
    , pathname = window.location.pathname.match(reg)

  // Return if no url match
  if (!pathname) return;

  // Create link
  var link = document.createElement('a')
  var t = document.createTextNode('Time Machine')
  link.appendChild(t)
  link.className = 'btn btn-sm'
  link.id = 'time-machine'
  link.target = '_blank'

  // Galaxy background
  var imgURL = chrome.extension.getURL("galaxy_button.png")
  link.style.backgroundImage="url('" + imgURL + "')"

  // Link to Time Machine page
  link.href = 'http://www.gittimemachine.com'
             + pathname[0]

  // Add to page
  buttonGroup[0].appendChild(link)

}
