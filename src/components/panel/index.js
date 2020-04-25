import React from 'react'
import {
  Panel,
  FlexboxGrid
} from 'rsuite'
import './panel.css'

const MaintPanel = props => {
  return (
    <Panel header={props.header} bordered shaded bodyFill style={{ background: '#fff' }}>
      <FlexboxGrid justify='space-around' colspan={23}>
        {props.children}
      </FlexboxGrid>
    </Panel>
  )
}

export default MaintPanel
