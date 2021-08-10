import create from "zustand"

const useStore = create((set) => ({
  count: 0,
  setCount: (num) => {
    set((state) => (state.count = num))
  },
  rescheduleData: [],
  setRescheduleData: (rescheduleMaint) => {
    set((state) => (state.rescheduleData = rescheduleMaint))
  },
}))

export default useStore
