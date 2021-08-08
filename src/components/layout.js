import { useEffect } from "react"
import useSWR from "swr"
import dynamic from "next/dynamic"
import useStore from "./store"
import MaintHeader from "./header"
import { Container, Content, FlexboxGrid } from "rsuite"

if (typeof window !== "undefined") {
  const WebFontLoader = require("webfontloader")
  WebFontLoader.load({
    google: {
      families: ["Fira Sans:200,400", "Chivo:300,400,700"],
    },
  })
}

// TODO: Darkmode
// https://github.com/kazzkiq/darkmode
// https://joshwcomeau.com/gatsby/dark-mode/
// https://hankchizljaw.com/wrote/create-a-user-controlled-dark-or-light-mode/

const UnreadFavicon = dynamic(() => import("./unreadcount"), { ssr: false })

const Layout = ({ children }) => {
  const setCount = useStore((state) => state.setCount)

  const { data } = useSWR(
    "/v1/api/count",
    (url) => fetch(url).then((res) => res.json()),
    { refreshInterval: 30000, focusThrottleInterval: 10000 }
  )

  useEffect(() => {
    setCount(data ? data.count : 0)
  }, [data, setCount])

  return (
    <div>
      <UnreadFavicon />
      <Container>
        <MaintHeader />
        <Content>
          <FlexboxGrid justify="center">
            <FlexboxGrid.Item colspan={23} style={{ marginTop: "20px" }}>
              {children}
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Content>
      </Container>
    </div>
  )
}

export default Layout
