// import { createConnectedStore } from "undux"

// export default createConnectedStore({
//   count: 0,
//   session: {},
//   maintenance: {},
//   impactPlaceholder: "",
//   comments: [],
//   rescheduleData: [],
//   night: false,
// })
import create from "zustand"

const useStore = create((set) => ({
  // bears: 0,
  // increasePopulation: () => set(state => ({ bears: state.bears + 1 })),
  // removeAllBears: () => set({ bears: 0 })
  count: 0,
  // setCount: (mails) => set(count, mails),
  setCount: (num) => {
    set((state) => (state.count = num))
  },
  session: {},
  maintenance: {},
  impactPlaceholder: "",
  comments: [],
  rescheduleData: [],
}))

export default useStore
