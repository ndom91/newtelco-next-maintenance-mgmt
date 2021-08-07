import useSWR from "swr"
import Router from "next/router"
import format from "date-fns/format"
import {
  Loader,
  List,
  Avatar,
  FlexboxGrid,
  Panel,
  Icon,
  IconButton,
  Dropdown,
  Tag,
  ButtonGroup,
  Whisper,
  Tooltip,
} from "rsuite"

const ActiveMaintenances = () => {
  const { data } = useSWR(
    "/api/homepage/active",
    (...args) => fetch(...args).then((res) => res.json()),
    { suspense: false, revalidateOnFocus: false }
  )

  if (data) {
    return (
      <Panel
        bordered
        header={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            Active & Upcoming
            <Icon icon="bolt" style={{ color: "var(--primary)" }} size="lg" />
          </div>
        }
        style={{ height: "100%" }}
      >
        <List style={{ overflow: "visible" }}>
          {data.query.length > 0 ? (
            data.query.map((item) => {
              return (
                <List.Item key={item.id}>
                  <FlexboxGrid
                    align="middle"
                    justify="space-between"
                    style={{ margin: "10px 0px" }}
                  >
                    <FlexboxGrid.Item
                      colspan={4}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Avatar
                        style={{ backgroundColor: "transparent" }}
                        src={`/v1/api/faviconUrl?d=${item.mailDomain || ""}`}
                      />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item
                      style={{
                        flexGrow: "1",
                        marginRight: "5px",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          height: "100px",
                          width: "100%",
                          padding: "5px",
                          justifyContent: "space-between",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            paddingLeft: "5px",
                            alignItems: "center",
                          }}
                        >
                          <Tag style={{ marginRight: "5px" }} color="green">
                            NT-{item.maintId}
                          </Tag>
                          {item.emergency === 1 && (
                            <Whisper
                              placement="top"
                              speaker={<Tooltip>Emergency</Tooltip>}
                            >
                              <svg
                                height="24"
                                width="24"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
                                />
                              </svg>
                            </Whisper>
                          )}
                        </div>
                        <div
                          style={{
                            fontWeight: "500",
                            paddingLeft: "5px",
                            fontSize: "1.1rem",
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          style={{
                            width: "100%",
                            display: "inline-flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Tag>
                            {format(
                              new Date(item.startDateTime),
                              "HH:mm - dd.LL.yyyy"
                            )}
                          </Tag>
                          to
                          <Tag>
                            {format(
                              new Date(item.endDateTime),
                              "HH:mm - dd.LL.yyyy"
                            )}
                          </Tag>
                        </div>
                      </div>
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item colspan={3}>
                      <ButtonGroup vertical className="active-btn-group">
                        <Whisper
                          placement="top"
                          speaker={<Tooltip>Open Maintenance</Tooltip>}
                        >
                          <IconButton
                            appearance="default"
                            size="md"
                            style={{
                              justifyContent: "start",
                              height: "45px",
                            }}
                            onClick={() =>
                              Router.push({
                                pathname: "/maintenance",
                                query: { id: item.maintId },
                              })
                            }
                            icon={
                              <svg
                                height="24"
                                width="24"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            }
                          />
                        </Whisper>
                        <Whisper
                          placement="bottom"
                          speaker={<Tooltip>Contact</Tooltip>}
                        >
                          <IconButton
                            appearance="default"
                            href={`mailto:${
                              item.maintenanceRecipient
                            }?subject=${encodeURIComponent(
                              `Newtelco Maintenance NT-${item.maintId} - `
                            )}`}
                            size="md"
                            style={{
                              flexDirection: "column",
                              justifyContent: "center",
                              height: "45px",
                              alignItems: "start",
                              display: "flex",
                            }}
                            icon={
                              <svg
                                height="24"
                                width="24"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                />
                              </svg>
                            }
                          />
                        </Whisper>
                      </ButtonGroup>
                    </FlexboxGrid.Item>
                  </FlexboxGrid>
                </List.Item>
              )
            })
          ) : (
            <List.Item>
              <div style={{ display: "flex", justifyContent: "center" }}>
                No Active Maintenances
              </div>
            </List.Item>
          )}
        </List>
      </Panel>
    )
  } else {
    return (
      <Panel
        bordered
        header={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            Active
            <Icon icon="bolt" style={{ color: "var(--primary)" }} size="lg" />
          </div>
        }
        style={{ height: "100%" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "200px",
          }}
        >
          <Loader />
        </div>
      </Panel>
    )
  }
}

export default ActiveMaintenances
