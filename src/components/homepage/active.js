import React from 'react'
import useSWR from 'swr'
import Router from 'next/router'
import format from 'date-fns/format'
import {
  Loader,
  List,
  Avatar,
  FlexboxGrid,
  Panel,
  Icon,
  IconButton,
  Dropdown
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
        <List style={{ overflow: 'visible' }}>
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
                      <Dropdown
                        renderTitle={() => {
                          return (
                            <IconButton appearance='subtle' icon={<Icon icon='ellipsis-v' />} />
                          )
                        }}
                        placement='bottomEnd'
                      >
                        <Dropdown.Item onClick={() => Router.push({ pathname: '/maintenance', query: { id: item.maintId } })}>View</Dropdown.Item>
                        <Dropdown.Item target='_blank' href={`mailto:${item.maintenanceRecipient}?subject=${encodeURIComponent(`Newtelco - Regarding Maintenance NT-${item.maintId}`)}`}>Contact</Dropdown.Item>
                      </Dropdown>
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
      <Panel bordered header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Active<Icon icon='bolt' style={{ color: 'var(--primary)' }} size='lg' /></div>} style={{ height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '200px' }}>
          <Loader />
        </div>
      </Panel>
    )
  }
}

export default ActiveMaintenances
