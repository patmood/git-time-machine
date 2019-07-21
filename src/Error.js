import React from 'react'

const style = { color: 'red', padding: '1em', background: 'rgba(255,0,0,0.05)' }

function Error({ error }) {
  return <pre style={style}>{JSON.stringify(error, null, 2)}</pre>
}

export { Error }
