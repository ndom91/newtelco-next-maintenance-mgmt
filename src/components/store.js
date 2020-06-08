import { createConnectedStore, withLogger } from 'undux'

export default createConnectedStore(
  {
    count: 0,
    session: {},
    maintenance: {},
    impactPlaceholder: '',
    comments: [],
    rescheduleData: [],
  },
  withLogger
)
