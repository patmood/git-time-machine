import React, { useEffect, useState } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { formatDistance } from 'date-fns'
import { Link } from 'react-router-dom'
import cn from 'classnames'
import { withRouter } from 'react-router-dom'

import { Loading } from './Loading'
import { Error } from './Error'

import css from './FileHistory.module.css'

const historyQuery = gql`
  query HistoryForFile($repo: String!, $owner: String!, $path: String!) {
    repository(name: $repo, owner: $owner) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 10, path: $path) {
              edges {
                node {
                  ... on Commit {
                    oid
                    commitResourcePath
                    message
                    changedFiles
                    committedDate
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const FileHistory = withRouter(function FileHistory(props) {
  const { owner, repo, gitRef, path } = props
  const [edges, setEdges] = useState([])

  function handleKeydown(e) {
    if (e.key === 'ArrowLeft') {
      let activeIndex = edges.findIndex(edge => edge.node.oid === gitRef)
      const newEdge = edges[activeIndex - 1]
      props.history.push(`/${owner}/${repo}/blob/${newEdge.node.oid}/${path}`)
    } else if (e.key === 'ArrowRight') {
      let activeIndex = edges.findIndex(edge => edge.node.oid === gitRef)
      const newEdge = edges[activeIndex + 1]
      props.history.push(`/${owner}/${repo}/blob/${newEdge.node.oid}/${path}`)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })

  return (
    <div>
      <h1>FileHistory</h1>
      <Query query={historyQuery} variables={{ owner, repo, path }}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />
          if (error) return <Error error={error} />

          const { edges } = data.repository.defaultBranchRef.target.history
          setEdges(edges)
          return (
            <ul className={css.list}>
              {edges.map(({ node }) => {
                const timeAgo = formatDistance(
                  new Date(node.committedDate),
                  new Date()
                )
                return (
                  <li
                    key={node.oid}
                    className={cn(css.item, {
                      [css.active]: node.oid === gitRef,
                    })}
                  >
                    <Link to={`/${owner}/${repo}/blob/${node.oid}/${path}`}>
                      <div className={css.message}>{node.message}</div>
                      <div className={css.timeAgo}>{timeAgo}</div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )
        }}
      </Query>
    </div>
  )
})

export { FileHistory }
