// Each glaze has a flat "unfired" chalky look (applied in the Glaze stage)
// and a distinct set of parameters driving the procedural fired shader.
export const GLAZE_DEFS = [
  {
    id: 'celadon',
    label: 'Celadon',
    unfiredColor: '#aab8a8',
    fired: {
      base: '#7fa88f',
      rim: '#2f4f42',
      speckle: '#d8e8d0',
    },
  },
  {
    id: 'tenmoku',
    label: 'Tenmoku',
    unfiredColor: '#3a332e',
    fired: {
      base: '#1c1512',
      rim: '#5a3a22',
      speckle: '#b8874a',
    },
  },
  {
    id: 'shino',
    label: 'Shino',
    unfiredColor: '#d9cdb8',
    fired: {
      base: '#e8dcc0',
      rim: '#a9713f',
      speckle: '#f5ecd8',
    },
  },
  {
    id: 'ash',
    label: 'Ash',
    unfiredColor: '#8f9490',
    fired: {
      base: '#78827a',
      rim: '#cfd8c8',
      speckle: '#3d443e',
    },
  },
  {
    id: 'cobalt',
    label: 'Cobalt',
    unfiredColor: '#5f6f8a',
    fired: {
      base: '#294a82',
      rim: '#0f1f42',
      speckle: '#9db8e0',
    },
  },
]

export function getGlazeDef(id) {
  return GLAZE_DEFS.find((g) => g.id === id) || GLAZE_DEFS[0]
}
