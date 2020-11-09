import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdateCommentContentPayload from '../types/UpdateCommentContentPayload'

export default {
  type: UpdateCommentContentPayload,
  description: 'Update the content of a comment',
  args: {
    commentId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A stringified draft-js document containing thoughts'
    }
  },
  async resolve(
    _source,
    {commentId, content},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const now = new Date()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const comment = await r
      .table('Comment')
      .get(commentId)
      .run()
    if (!comment || !comment.isActive) {
      return standardError(new Error('comment not found'), {userId: viewerId})
    }

    const {createdBy, threadId, threadSource} = comment
    if (createdBy !== viewerId) {
      return {error: {message: 'Can only update your own comment'}}
    }

    const thread = await dataLoader
      .get('threadSources')
      .load({sourceId: threadId, type: threadSource})
    const {meetingId} = thread

    // VALIDATION
    const normalizedContent = normalizeRawDraftJS(content)

    // RESOLUTION
    const plaintextContent = extractTextFromDraftString(normalizedContent)
    await r
      .table('Comment')
      .get(commentId)
      .update({content: normalizedContent, plaintextContent, updatedAt: now})
      .run()

    const data = {commentId}
    if (meetingId) {
      publish(
        SubscriptionChannel.MEETING,
        meetingId,
        'UpdateCommentContentSuccess',
        data,
        subOptions
      )
    }
    return data
  }
}
