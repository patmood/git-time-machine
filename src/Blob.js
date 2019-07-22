import React, { useState } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import cn from 'classnames'
import { Error } from './Error'

import css from './Blob.module.css'

const textQuery = gql`
  query File($repo: String!, $owner: String!, $expression: String!) {
    repository(name: $repo, owner: $owner) {
      object(expression: $expression) {
        ... on Blob {
          text
        }
      }
    }
  }
`

const Blob = React.memo(function Blob(props) {
  const { owner, repo, gitRef, path } = props
  const expression = `${gitRef}:${path}`
  const [text, setText] = useState('')
  return (
    <div>
      <h1>Blob</h1>
      <Query query={textQuery} variables={{ owner, repo, expression }}>
        {({ loading, error, data }) => {
          if (error) return <Error error={error} />

          if (!loading) {
            setText(data.repository.object.text)
          }

          return <pre className={cn({ [css.loading]: loading })}>{text}</pre>
        }}
      </Query>
    </div>
  )
})

export { Blob }
