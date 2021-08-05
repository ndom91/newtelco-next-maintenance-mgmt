import React, { useState, useEffect } from "react"
import Head from "next/head"
import MaintHeader from "./header"
import useSWR from "swr"
import dynamic from "next/dynamic"
import Store from "./store"
import { Container, Content, Modal, Button, FlexboxGrid } from "rsuite"

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
  const [style, setStyle] = useState("/static/css/rsuite-default.css")
  const store = Store.useStore()

  const { data } = useSWR(
    "/v1/api/count",
    (url) => fetch(url).then((res) => res.json()),
    { refreshInterval: 30000, focusThrottleInterval: 10000 }
  )

  useEffect(() => {
    store.set("count")(data ? data.count : 0)
  }, [data])

  store.on("night").subscribe((night) => {
    fetch(
      night ? "/static/css/rsuite-dark.css" : "/static/css/rsuite-default.css"
    )
      .then((response) => response.text())
      .then((data) => {
        setStyle(data)
      })
  })

  return (
    <div>
      <Head>
        <style>{style}</style>
      </Head>
      <UnreadFavicon count={store.get("count")} />
      <Container>
        <MaintHeader unread={store.get("count")} />
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
