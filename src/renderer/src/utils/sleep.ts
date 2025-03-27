export const sleep = (timeout: number) => new Promise((res) => setTimeout(() => res("resolved"), timeout));
