// Los 5 objetivos de prueba oficiales. El `id` es el valor de /sky?target=<id>:
// vive aquí (y no dentro de la landing) para que la página /sky lo reutilice y
// ambas partes no puedan desincronizarse. Ids en minúsculas y con guiones: son
// estables en una URL (sin espacios ni mayúsculas que haya que codificar).
export const targets = [
  { id: 'barnard', name: 'Barnard' },
  { id: 'epsilon-indi-b', name: 'Epsilon Indi B' },
  { id: 'wise-0855', name: 'WISE 0855' },
  { id: 'rw-aur', name: 'RW Aur' },
  { id: 'r-dra', name: 'R Dra' },
] as const
