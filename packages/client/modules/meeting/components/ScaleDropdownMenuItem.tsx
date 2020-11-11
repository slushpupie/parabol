import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import textOverflow from '~/styles/helpers/textOverflow'
import {PALETTE} from '~/styles/paletteV2'
import {FONT_FAMILY} from '~/styles/typographyV2'
import {MenuProps} from '../../../hooks/useMenu'
import {ScaleDropdownMenuItem_dimension} from '../../../__generated__/ScaleDropdownMenuItem_dimension.graphql'
import {ScaleDropdownMenuItem_scale} from '../../../__generated__/ScaleDropdownMenuItem_scale.graphql'
import CloneScale from './CloneScale'

interface Props {
  scale: ScaleDropdownMenuItem_scale
  dimension: ScaleDropdownMenuItem_dimension
  menuProps: MenuProps
}

const ScaleDetails = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'flex-start'
})

const ScaleNameAndValues = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 12,
  paddingLeft: 16,
  paddingBottom: 12
})

const ScaleName = styled('div')({
  ...textOverflow,
  color: PALETTE.TEXT_MAIN,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px'
})

const ScaleValues = styled('div')({
  ...textOverflow,
  color: PALETTE.TEXT_GRAY,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 12,
  lineHeight: '16px'
})

const CloneScaleButton = styled('div')({
  display: 'block',
  marginLeft: 'auto',
  marginTop: 'auto',
  marginBottom: 'auto'
})

const ScaleDropdownMenuItem = (props: Props) => {
  const {scale, dimension, menuProps} = props
  const {values} = scale
  const availableScalesCount = dimension.availableScales.length
  return (
    <ScaleDetails>
      <ScaleNameAndValues>
        <ScaleName>{scale.name}</ScaleName>
        <ScaleValues>
          {
            values.map(
              ({label, isSpecial}) => {
                return isSpecial && label === 'X' ? "Pass" : label
              }
            )
              .join(", ")
          }
        </ScaleValues>
      </ScaleNameAndValues>
      <CloneScaleButton>
        <CloneScale scaleId={scale.id} scaleCount={availableScalesCount} teamId={"aDw6KWqar"} menuProps={menuProps} />
      </CloneScaleButton>
    </ScaleDetails>
  )
}

export default createFragmentContainer(ScaleDropdownMenuItem, {
  dimension: graphql`
    fragment ScaleDropdownMenuItem_dimension on TemplateDimension {
      availableScales {
        id
      }
    }
  `,
  scale: graphql`
    fragment ScaleDropdownMenuItem_scale on TemplateScale {
      id
      name
      values {
        label
        isSpecial
      }
    }
  `
})