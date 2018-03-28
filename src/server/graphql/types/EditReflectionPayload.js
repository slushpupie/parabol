/**
 * The mutation/subscription payload for when a reflection's `isEditing`
 * state changes.
 *
 * @flow
 */
import {GraphQLBoolean, GraphQLObjectType} from 'graphql';
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import NewMeeting from 'server/graphql/types/NewMeeting';
import RetroReflection from 'server/graphql/types/RetroReflection';

const EditReflectionPayload = new GraphQLObjectType({
  name: 'EditReflectionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    reflection: {
      type: RetroReflection,
      resolve: makeResolve('reflectionId', 'reflection', 'retroReflections')
    },
    isEditing: {
      type: GraphQLBoolean,
      description: 'true if the reflection is being edited, else false '
    }
  })
});

export default EditReflectionPayload;
