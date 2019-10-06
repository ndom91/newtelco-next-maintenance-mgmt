import React, { useState } from 'react'
import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'
import useCustomKeygen from '../../lib/useCustomKeygen'
import CannerEditor from 'canner-slate-editor'

// const DomParser = require('dom-parser')

const NextEditor = ({ slateKey, defaultValue, ...props }) => {
  useCustomKeygen(slateKey)
  const [state, setState] = useState(() => Plain.deserialize(defaultValue))

  return (
    <Editor
      placeholder='Enter notes here...'
      value={state}
      onChange={({ value }) => setState(value)}
    />
  )
}

export default NextEditor