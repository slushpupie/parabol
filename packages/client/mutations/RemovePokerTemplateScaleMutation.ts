import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {CompletedHandler, ErrorHandler, SharedUpdater} from '../types/relayMutations'
import handleRemovePokerTemplateScale from './handlers/handleRemovePokerTemplateScale'
import {IRemovePokerTemplateScaleOnMutationArguments} from '../types/graphql'
import {RemovePokerTemplateScaleMutation_scale} from '../__generated__/RemovePokerTemplateScaleMutation_scale.graphql'
import {RemovePokerTemplateScaleMutation as IRemovePokerTemplateScaleMutation} from '../__generated__/RemovePokerTemplateScaleMutation.graphql'
import getInProxy from '~/utils/relay/getInProxy'

graphql`
  fragment RemovePokerTemplateScaleMutation_scale on RemovePokerTemplateScalePayload {
    scale {
      id
      teamId
    }
  }
`

const mutation = graphql`
  mutation RemovePokerTemplateScaleMutation($scaleId: ID!) {
    removePokerTemplateScale(scaleId: $scaleId) {
      ...RemovePokerTemplateScaleMutation_scale @relay(mask: false)
    }
  }
`

export const removePokerTemplateScaleTeamUpdater: SharedUpdater<RemovePokerTemplateScaleMutation_scale> = (
  payload,
  {store}
) => {
  const scaleId = getInProxy(payload, 'scale', 'id')
  const teamId = getInProxy(payload, 'scale', 'teamId')
  handleRemovePokerTemplateScale(scaleId, teamId, store)
}

const RemovePokerTemplateScaleMutation = (
  atmosphere: Atmosphere,
  variables: IRemovePokerTemplateScaleOnMutationArguments,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  return commitMutation<IRemovePokerTemplateScaleMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removePokerTemplateScale')
      if (!payload) return
      removePokerTemplateScaleTeamUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {scaleId} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      const teamId = scale.getValue('teamId') as string
      if (!teamId) return
      handleRemovePokerTemplateScale(scaleId, teamId, store)
    }
  })
}

export default RemovePokerTemplateScaleMutation
