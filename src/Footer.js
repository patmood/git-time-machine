import React from 'react'
import { Link } from 'react-router-dom'

function Footer(props) {
  return (
    <footer>
      <Link to="/">Home</Link>
      <Link to="/boogers">new</Link>
    </footer>
  )
}

export { Footer }
