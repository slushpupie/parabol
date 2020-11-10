import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {GQLContext} from '../graphql'

const TemplateScaleValue = new GraphQLObjectType<any, GQLContext>({
  name: 'TemplateScaleValue',
  description: 'A value for a scale.',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      resolve: ({scaleId, value}) => {
        return `${scaleId}:${value}`
      }
    },
    color: {
      description: 'The color used to visually group a scale value',
      type: new GraphQLNonNull(GraphQLString)
    },
    value: {
      description: 'The numerical value for this scale value',
      type: new GraphQLNonNull(GraphQLInt)
    },
    label: {
      description: 'The label for this value, e.g., XS, M, L',
      type: new GraphQLNonNull(GraphQLString)
    },
    isSpecial: {
      description: 'true if the value of this scale is a special value, e.g., ? or X',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({isSpecial}) => !!isSpecial
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'the order of the scale value in this scale',
      resolve: ({value}) => value
    }
  })
})

export default TemplateScaleValue
