import { createConnectedStore } from 'undux'

export default createConnectedStore({
  count: 0,
  session: {},
  maintenance: {},
  impactPlaceholder: '',
  comments: []
})
