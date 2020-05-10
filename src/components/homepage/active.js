import React from 'react'
import useSWR from 'swr'
import format from 'date-fns/format'
import {
  Loader,
  List,
  Avatar,
  FlexboxGrid,
  Panel,
  Icon,
  IconButton,
  Whisper,
  Tooltip,
  Badge,
  Divider
} from 'rsuite'

const ActiveMaintenances = () => {
  const { data } = useSWR(
    '/api/homepage/active',
    (...args) => fetch(...args).then(res => res.json()),
    { suspense: false, revalidateOnFocus: false }
  )

  if (data) {
    return (
      <Panel bordered header='Active'>
        <List>
          {data.query.map(item => {
            return (
              <List.Item key={item.id}>
                <FlexboxGrid align='middle' justify='space-between'>
                  <FlexboxGrid.Item colspan={3}>
                    <Avatar style={{ backgroundColor: 'transparent' }} src={`/v1/api/faviconUrl?d=${item.mailDomain || ''}`} />
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item colspan={17}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span><b>{item.name}</b></span>
                      <span>{item.bearbeitetvon}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {format(new Date(item.startDateTime), 'LL.dd.yyyy @ HH:mm')} <Icon icon='chevron-circle-right' /> {format(new Date(item.endDateTime), 'LL.dd.yyyy @ HH:mm')}
                    </div>
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item colspan={3}>
                    <Whisper placement='left' speaker={<Tooltip>Open Maintenance</Tooltip>}>
                      <Badge content={item.maintId} maxCount={2000}>
                        <IconButton appearance='ghost' circle icon={<Icon icon='link' />} />
                      </Badge>
                    </Whisper>
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </List.Item>
            )
          })}
        </List>
      </Panel>
    )
  } else {
    return (
      <div style={{ height: '640px', width: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader />
      </div>
    )
  }
}

export default ActiveMaintenances
