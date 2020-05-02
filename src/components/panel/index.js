import React from 'react'
import {
  Panel,
  FlexboxGrid,
  Col
} from 'rsuite'
import './panel.css'

const MaintPanel = props => {
  return (
    <Panel header={props.header} bordered shaded bodyFill style={{ background: '#fff' }}>
      <FlexboxGrid justify='space-around' colSpan={23} style={{ padding: '20px', width: '100%' }}>
        {props.children}
      </FlexboxGrid>
    </Panel>
  )
}

export default MaintPanel
