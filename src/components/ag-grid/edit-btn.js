import React from "react"
import Link from "next/link"
import { IconButton, Whisper, Tooltip } from "rsuite"

export const EditBtn = ({ node }) => {
  return (
    <Link
      href={{ pathname: "/maintenance", query: { id: node.data.id } }}
      as={`/maintenance?id=${node.data.id}`}
      passHref
    >
      <Whisper placement="left" speaker={<Tooltip>Edit</Tooltip>}>
        <IconButton
          size="md"
          appearance="ghost"
          style={{
            paddingLeft: "9px",
            paddingRight: "8px",
            border: "1px solid var(--primary)",
          }}
          icon={
            <svg
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="var(--primary)"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          }
        />
      </Whisper>
    </Link>
  )
}
