// core/store/storeRegistry.ts
type Resettable = { reset: () => void };

const resettableStores = new Set<Resettable>();

export const registerResettableStore = (store: Resettable) => {
  resettableStores.add(store);
};

export const resetAllStores = () => {
  resettableStores.forEach((store) => store.reset());
};
