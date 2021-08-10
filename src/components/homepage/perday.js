import useSWR from "swr"
import { Loader, Placeholder } from "rsuite"

const Heatmap = () => {
  const { data } = useSWR(
    "/api/maintenances/perday",
    (...args) => fetch(...args).then((res) => res.json()),
    { revalidateOnFocus: false }
  )

  if (data) {
    return <div style={{ width: "100%", maxWidth: "1300px" }}>TODO</div>
  } else {
    return (
      <div style={{ height: "165px", width: "100%", maxWidth: "1300px" }}>
        <Placeholder.Graph
          active
          height="165px"
          style={{
            maxWidth: "1300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader content="Loading..." />
        </Placeholder.Graph>
      </div>
    )
  }
}

export default Heatmap
