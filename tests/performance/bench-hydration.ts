/**
 * Benchmark temporário da etapa 2 — hidratação de models.
 * Uso: node --import=@athenna/tsconfig bench-hydration.ts
 */
import { BaseModel } from '#src/models/BaseModel'
import { Column } from '#src/models/annotations/Column'
import { ModelGenerator } from '#src/models/factories/ModelGenerator'

class Bench extends BaseModel {
  @Column() public c0: number
  @Column() public c1: number
  @Column() public c2: number
  @Column() public c3: number
  @Column() public c4: number
  @Column() public c5: number
  @Column() public c6: number
  @Column() public c7: number
  @Column() public c8: number
  @Column() public c9: number
  @Column() public c10: number
  @Column() public c11: number
  @Column() public c12: number
  @Column() public c13: number
  @Column() public c14: number
  @Column() public c15: number
  @Column() public c16: number
  @Column() public c17: number
  @Column() public c18: number
  @Column() public c19: number
}

const ROWS = 5000
const row = (i: number) => {
  const r: any = {}
  for (let c = 0; c < 20; c++) r[`c${c}`] = i + c
  return r
}
const data = Array.from({ length: ROWS }, (_, i) => row(i))

// warmup
await new ModelGenerator(Bench as any, Bench.schema()).generateMany(data)

const runs: number[] = []
for (let i = 0; i < 5; i++) {
  const gen = new ModelGenerator(Bench as any, Bench.schema())
  const start = performance.now()
  await gen.generateMany(data)
  runs.push(performance.now() - start)
}

console.log(
  `generateMany ${ROWS}x20: median ${runs.sort((a, b) => a - b)[2].toFixed(1)}ms | runs: ${runs
    .map(r => r.toFixed(1))
    .join(', ')}`
)

let start = performance.now()
const schema = Bench.schema()
for (let i = 0; i < 100_000; i++) schema.getColumnByName('c19')
console.log(`getColumnByName x100k: ${(performance.now() - start).toFixed(1)}ms`)

start = performance.now()
for (let i = 0; i < 1000; i++) Bench.schema()
console.log(`schema() x1000: ${(performance.now() - start).toFixed(1)}ms`)

// --- benchmark direto do setOriginal ---
class Child extends BaseModel {
  @Column() public id: number
  @Column() public name: string
}

class Parent extends BaseModel {
  @Column() public id: number
  @Column() public name: string
  @Column() public meta: any
  @Column() public createdAt: Date
}

const makeParent = (i: number, children: number) => {
  const p = new Parent()
  p.id = i
  p.name = `parent-${i}`
  p.meta = { tags: ['a', 'b', 'c'], nested: { x: 1, y: 2 } }
  p.createdAt = new Date()
  ;(p as any).children = Array.from({ length: children }, (_, c) => {
    const ch = new Child()
    ch.id = c
    ch.name = `child-${c}`
    ch.setOriginal()
    return ch
  })
  return p
}

for (const children of [0, 10]) {
  const parents = Array.from({ length: 5000 }, (_, i) => makeParent(i, children))
  const start = performance.now()
  parents.forEach(p => p.setOriginal())
  console.log(
    `setOriginal x5000 (json+date cols, ${children} filhos carregados): ${(performance.now() - start).toFixed(1)}ms`
  )
}
