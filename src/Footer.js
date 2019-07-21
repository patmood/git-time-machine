import React from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'

function Footer(props) {
  return (
    <footer>
      <Link to="/">Home</Link>
      <Link to="/boogers">new</Link>
    </footer>
  )
}

export default withRouter(Footer)
