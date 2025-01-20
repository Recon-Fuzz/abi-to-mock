
export const fs = {
  existsSync: () => false,
  mkdirSync: () => {},
  writeFileSync: () => {},
  readFileSync: () => ''
};

export const path = {
  resolve: (...paths: string[]) => paths.join('/'),
  join: (...paths: string[]) => paths.join('/'),
  relative: (from: string, to: string) => to
};