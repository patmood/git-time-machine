import React from 'react'
import { FileHistory } from './FileHistory'
import { Blob } from './Blob'

function BlobPage(props) {
  return (
    <div>
      <h1>BlobPage</h1>
      <FileHistory {...props.match.params} />
      <Blob {...props.match.params} />
    </div>
  )
}

export { BlobPage }
