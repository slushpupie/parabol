import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import db from '../../db'
import {GQLContext} from '../graphql'
import connectionFromTemplateArray from '../queries/helpers/connectionFromTemplateArray'
import getPublicScoredTemplates from '../queries/helpers/getPublicScoredTemplates'
import getScoredTemplates from '../queries/helpers/getScoredTemplates'
import resolveSelectedTemplate from '../queries/helpers/resolveSelectedTemplate'
import TeamMeetingSettings, {teamMeetingSettingsFields} from './TeamMeetingSettings'
import TemplateScale from './TemplateScale'
import PokerTemplate, {PokerTemplateConnection} from './PokerTemplate'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'

const PokerMeetingSettings = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerMeetingSettings',
  description: 'The retro-specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields(),
    selectedTemplateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK. The template that will be used to start the poker meeting'
    },
    selectedTemplate: {
      type: GraphQLNonNull(PokerTemplate),
      description: 'The template that will be used to start the Poker meeting',
      resolve: resolveSelectedTemplate('estimatedEffortTemplate')
    },
    teamScales: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateScale))),
      description: 'The list of scales belong to this team',
      resolve: async ({teamId}, _args, {dataLoader}) => {
        const activeScales = await dataLoader.get('scalesByTeamId').load(teamId)
        activeScales.slice().sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
        return activeScales
      }
    },
    scale: {
      type: TemplateScale,
      description: 'A query for the scale',
      args: {
        scaleId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The scale ID for the desired scale'
        }
      },
      resolve: async ({teamId}, {scaleId}, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const activeScales = await dataLoader.get('scalesByTeamId').load(teamId)
        const scale = activeScales.find(({id}) => id === scaleId)
        if (!scale) {
          standardError(new Error('Scale not found'), {userId: viewerId})
          return null
        }
        return scale
      }
    },
    teamTemplates: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PokerTemplate))),
      description: 'The list of templates used to start a Poker meeting',
      resolve: async ({teamId}, _args, {dataLoader}) => {
        const templates = await dataLoader
          .get('meetingTemplatesByType')
          .load({teamId, meetingType: MeetingTypeEnum.poker})
        const scoredTemplates = await getScoredTemplates(templates, 0.9)
        return scoredTemplates
      }
    },
    organizationTemplates: {
      type: GraphQLNonNull(PokerTemplateConnection),
      args: {
        first: {
          type: GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLID,
          description: 'The cursor, which is the templateId'
        }
      },
      description: 'The list of templates shared across the organization to start a Poker meeting',
      resolve: async ({teamId}, {first, after}, {dataLoader}) => {
        const team = await dataLoader.get('teams').load(teamId)
        const {orgId} = team
        const templates = await dataLoader.get('meetingTemplatesByOrgId').load(orgId)
        const organizationTemplates = templates.filter(
          (template) =>
            template.scope !== 'TEAM' &&
            template.teamId !== teamId &&
            template.type === MeetingTypeEnum.poker
        )
        const scoredTemplates = await getScoredTemplates(organizationTemplates, 0.8)
        return connectionFromTemplateArray(scoredTemplates, first, after)
      }
    },
    starterScales: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateScale))),
      description: 'The list of starter scales',
      resolve: async (_srouce, _args, _context) => {
        return await db.read('starterScales', 'aGhostTeam')
      }
    },
    publicTemplates: {
      type: GraphQLNonNull(PokerTemplateConnection),
      description: 'The list of templates shared across the organization to start a Poker meeting',
      args: {
        first: {
          type: GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLID,
          description: 'The cursor, which is the templateId'
        }
      },
      resolve: async ({teamId}, {first, after}, {dataLoader}) => {
        const [publicTemplates, team] = await Promise.all([
          db.read('publicTemplates', MeetingTypeEnum.poker),
          dataLoader.get('teams').load(teamId)
        ])
        const {orgId} = team
        const unownedTemplates = publicTemplates.filter((template) => template.orgId !== orgId)
        const scoredTemplates = await getPublicScoredTemplates(unownedTemplates)
        return connectionFromTemplateArray(scoredTemplates, first, after)
      }
    }
  })
})

export default PokerMeetingSettings
