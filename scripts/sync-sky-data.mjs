import { cp, readFile, access, mkdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const source = resolve(process.argv[2] ?? '../spaceappchallenge-back/public-data')
const destination = resolve('public/data')
await Promise.all(['targets/index.json', 'custom/presets.json'].map(file => access(join(source, file))))
const index = JSON.parse(await readFile(join(source, 'targets/index.json'), 'utf8'))
const custom = JSON.parse(await readFile(join(source, 'custom/presets.json'), 'utf8'))
for (const file of [...index.targets.map(t => 'targets/' + t.manifest), ...custom.presets.map(t => t.manifest)]) {
  await access(join(source, file))
}
await mkdir(destination, { recursive: true })
for (const directory of ['targets', 'custom']) await cp(join(source, directory), join(destination, directory), { recursive: true })
console.log('Datos SPHEREx sincronizados: ' + index.targets.length + ' objetivos y ' + custom.presets.length + ' campos.')
