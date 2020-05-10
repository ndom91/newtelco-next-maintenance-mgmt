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
  Badge
} from 'rsuite'

const ActiveMaintenances = () => {
  const { data } = useSWR(
    '/api/homepage/active',
    (...args) => fetch(...args).then(res => res.json()),
    { suspense: false, revalidateOnFocus: false }
  )

  if (data) {
    return (
      <Panel bordered header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Active<Icon icon='bolt' style={{ color: 'var(--primary)' }} size='lg' /></div>} style={{ height: '100%' }}>
        <List>
          {data.query.length > 0 ? (
            data.query.map(item => {
              return (
                <List.Item key={item.id}>
                  <FlexboxGrid align='middle' justify='space-between' style={{ margin: '10px 0px' }}>
                    <FlexboxGrid.Item colspan={3}>
                      <Avatar style={{ backgroundColor: 'transparent' }} src={`/v1/api/faviconUrl?d=${item.mailDomain || ''}`} />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item colspan={16}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span><b>{item.name}</b></span>
                        <span>{item.bearbeitetvon}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {format(new Date(item.startDateTime), 'LL.dd.yyyy @ HH:mm')} <Icon icon='page-next' /> {format(new Date(item.endDateTime), 'LL.dd.yyyy @ HH:mm')}
                      </div>
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item colspan={3}>
                      <Whisper placement='left' speaker={<Tooltip>Open Maintenance</Tooltip>}>
                        <Badge content={item.maintId} maxCount={2000}>
                          <IconButton appearance='ghost' circle icon={<Icon icon='frame' />} />
                        </Badge>
                      </Whisper>
                    </FlexboxGrid.Item>
                  </FlexboxGrid>
                </List.Item>
              )
            })
          ) : (
            <List.Item>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                No Active Maintenances
              </div>
            </List.Item>
          )}
        </List>
      </Panel>
    )
  } else {
    return (
      <div style={{ height: '100%', width: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader />
      </div>
    )
  }
}

export default ActiveMaintenances
