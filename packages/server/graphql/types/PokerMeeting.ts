import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {MeetingTypeEnum} from '../../../client/types/graphql'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import NewMeeting, {newMeetingFields} from './NewMeeting'
import PokerMeetingMember from './PokerMeetingMember'
import PokerMeetingSettings from './PokerMeetingSettings'

const PokerMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerMeeting',
  interfaces: () => [NewMeeting],
  description: 'A Poker meeting',
  fields: () => ({
    ...newMeetingFields(),
    commentCount: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The number of comments generated in the meeting',
      resolve: ({commentCount}) => commentCount || 0
    },
    meetingMembers: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(PokerMeetingMember))),
      description: 'The team members that were active during the time of the meeting',
      resolve: ({id: meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
      }
    },
    storyCount: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The number of stories scored during a meeting',
      resolve: ({storyCount}) => storyCount || 0
    },
    settings: {
      type: GraphQLNonNull(PokerMeetingSettings),
      description: 'The settings that govern the Poker meeting',
      resolve: async ({teamId}, _args, {dataLoader}) => {
        return dataLoader
          .get('meetingSettingsByType')
          .load({teamId, meetingType: MeetingTypeEnum.poker})
      }
    },
    // tasks: {
    //   type: GraphQLNonNull(GraphQLList(GraphQLNonNull(Task))),
    //   description: 'The tasks created within the meeting',
    //   resolve: async ({id: meetingId}, _args, {authToken, dataLoader}) => {
    //     const viewerId = getUserId(authToken)
    //     const meeting = await dataLoader.get('newMeetings').load(meetingId)
    //     const {teamId} = meeting
    //     const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
    //     return filterTasksByMeeting(teamTasks, meetingId, viewerId)
    //   }
    // },
    teamId: {
      type: GraphQLNonNull(GraphQLID)
    },
    templateId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID of the template used for the meeting'
    },
    viewerMeetingMember: {
      type: GraphQLNonNull(PokerMeetingMember),
      description: 'The Poker meeting member of the viewer',
      resolve: ({id: meetingId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        return dataLoader.get('meetingMembers').load(meetingMemberId)
      }
    }
  })
})

export default PokerMeeting
