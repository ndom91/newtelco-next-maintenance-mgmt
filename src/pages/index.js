import Router from "next/router"
import dynamic from "next/dynamic"
import { getSession } from "next-auth/client"
import { Loader, Panel, Icon } from "rsuite"
import Layout from "@/newtelco/layout"
import RequireLogin from "@/newtelco/require-login"
import MaintPanel from "@/newtelco/panel"
import UnreadBadge from "@/newtelco/unread"

const AreaChart = dynamic(() => import("../components/homepage/areachart"), {
  ssr: false,
  /* eslint-disable react/display-name */
  loading: () => (
    <Panel
      bordered
      header={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          Completed
          <Icon
            icon="bar-chart"
            style={{ color: "var(--primary)" }}
            size="lg"
          />
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
  ),
})

const Heatmap = dynamic(() => import("../components/homepage/heatmap"))
const BarChart = dynamic(() => import("../components/homepage/perperson"))
const ActiveMaintenances = dynamic(() =>
  import("../components/homepage/active")
)

const Index = ({ session }) => {
  if (typeof window !== "undefined" && !session) {
    Router.push("/auth/signin")
  }

  if (session) {
    return (
      <Layout>
        <MaintPanel header="Maintenance">
          <div className="grid-container">
            <div className="unread">
              <UnreadBadge />
            </div>
            <div className="heatmap">
              <Heatmap />
            </div>
            <div className="recents">
              <ActiveMaintenances />
            </div>
            <div className="chart1">
              <AreaChart />
            </div>
            <div className="chart2">
              <BarChart />
            </div>
          </div>
        </MaintPanel>
      </Layout>
    )
  } else {
    return <RequireLogin />
  }
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context),
    },
  }
}

export default Index
