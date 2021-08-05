import React, { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"

const ShadowDom = ({ children }) => {
  const shadowRef = useRef()
  const [shadowRoot, setShadowRoot] = useState(null)

  useEffect(() => {
    const shadowRoot2 = shadowRef.current.attachShadow({ mode: "open" })
    setShadowRoot(shadowRoot2)
  }, [])

  return (
    <div ref={shadowRef}>
      {shadowRoot && createPortal(children, shadowRoot)}
    </div>
  )
}

export default ShadowDom
