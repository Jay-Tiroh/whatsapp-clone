// No imports on purpose, so anything can depend on it without cycles.
let generation = 0;

export const getSessionGeneration = () => generation;
export const bumpSessionGeneration = () => ++generation;
