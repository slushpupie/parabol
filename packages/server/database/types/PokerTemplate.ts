import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import MeetingTemplate from './MeetingTemplate'

interface Input {
  name: string
  teamId: string
  scope?: string
  orgId: string
  parentTemplateId?: string
  lastUsedAt?: Date
}

export default class PokerTemplate extends MeetingTemplate {
  constructor(input: Input) {
    super({...input, type: MeetingTypeEnum.poker})
  }
}