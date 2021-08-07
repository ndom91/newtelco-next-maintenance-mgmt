import { Icon, Badge } from "rsuite"

export const SentIcon = ({ node }) => {
  const { sent } = node.data

  if (sent === "2" || sent === 2) {
    return (
      <div style={{ width: "32px", height: "40px" }}>
        <Badge content={sent}>
          <Icon
            style={{ color: "var(--primary)" }}
            size="lg"
            icon="check-circle"
          />
        </Badge>
      </div>
    )
  } else if (sent === "1" || sent === 1) {
    return (
      <div style={{ width: "32px", height: "40px" }}>
        <Icon
          style={{ color: "var(--primary)" }}
          size="lg"
          icon="check-circle"
        />
      </div>
    )
  } else {
    return (
      <div style={{ width: "32px", height: "40px" }}>
        <Icon size="lg" icon="warning" />
      </div>
    )
  }
}
