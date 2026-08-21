import { readFile, readdir } from "node:fs/promises"
import { basename, dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "lib",
  "generated",
)
const files = await readdir(root)
const jsonFiles = files.filter((file) => file.endsWith(".json"))
const failures = []

for (const jsonFile of jsonFiles) {
  const stem = basename(jsonFile, ".json")
  const svgFile = `${stem}.svg`
  if (!files.includes(svgFile)) {
    failures.push(`${jsonFile}: missing ${svgFile}`)
    continue
  }

  const source = JSON.parse(await readFile(join(root, jsonFile), "utf8"))
  const svg = await readFile(join(root, svgFile), "utf8")
  const nodeIds = source.nodes?.map((node) => node.id) ?? []

  for (const id of nodeIds) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    if (!new RegExp(`<g\\s+[^>]*id=["']${escaped}["']`).test(svg)) {
      failures.push(
        `${jsonFile}: node ${id} has no matching <g id="${id}"> in ${svgFile}`,
      )
    }
  }

  if (!nodeIds.includes(source.defaultSelected)) {
    failures.push(
      `${jsonFile}: defaultSelected ${source.defaultSelected} is not a node ID`,
    )
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"))
  process.exitCode = 1
} else {
  console.log(`Validated ${jsonFiles.length} diagram definition(s).`)
}
