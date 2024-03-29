import { Panel, FlexboxGrid } from "rsuite"
import "./panel.css"

const MaintPanel = ({
  children,
  header,
  buttons = null,
  center = null,
  ...props
}) => {
  const Header = () => {
    if (!buttons) {
      return <span>{header}</span>
    } else {
      return (
        <FlexboxGrid justify="space-between" align="middle">
          <FlexboxGrid.Item>{header}</FlexboxGrid.Item>
          <FlexboxGrid.Item className="header-middle">
            {center}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item>{buttons}</FlexboxGrid.Item>
        </FlexboxGrid>
      )
    }
  }
  return (
    <Panel
      className="maintpanel"
      header={Header()}
      bordered
      shaded
      bodyFill
      style={{ background: "var(--white)", margin: "50px 0 20px 0" }}
      {...props}
    >
      <FlexboxGrid
        justify="space-around"
        colSpan={23}
        style={{ padding: "20px", width: "100%" }}
      >
        {children}
      </FlexboxGrid>
    </Panel>
  )
}

export default MaintPanel
