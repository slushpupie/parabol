import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import renderQuery from '../../../utils/relay/renderQuery'
import PokerTemplateScaleDetails from './PokerTemplateScaleDetails'

const query = graphql`
  query PokerTemplateScaleDetailsRootQuery($teamId: ID!, $scaleId: ID!) {
    viewer {
      ...PokerTemplateScaleDetails_viewer
    }
  }
`

interface Props {
  isActive: boolean
  teamId?: string
  scaleId?: string
}

const PokerTemplateScaleDetailsRoot = (props: Props) => {
  const {isActive, teamId, scaleId} = props
  const atmosphere = useAtmosphere()
  if (!isActive) return null
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, scaleId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(PokerTemplateScaleDetails)}
    />
  )
}

export default PokerTemplateScaleDetailsRoot
