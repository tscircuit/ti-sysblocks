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
let productCount = 0
let technicalDocumentCount = 0

const finalPathSegment = (url) => {
  const segments = new URL(url).pathname.split("/").filter(Boolean)
  return decodeURIComponent(segments.at(-1) ?? "")
}

const validateTiUrl = (url, location) => {
  try {
    const hostname = new URL(url).hostname
    if (hostname !== "ti.com" && !hostname.endsWith(".ti.com")) {
      failures.push(`${location}: expected a ti.com URL, received ${url}`)
    }
  } catch {
    failures.push(`${location}: invalid URL ${url}`)
  }
}

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

  validateTiUrl(source.sourceUrl, `${jsonFile}: sourceUrl`)

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

  for (const node of source.nodes ?? []) {
    const seenPlacements = new Set()
    const seenTechnicalDocuments = new Set()

    for (const group of node.details?.productGroups ?? []) {
      for (const section of group.sections ?? []) {
        for (const product of section.products ?? []) {
          productCount += 1
          const location = `${jsonFile}: ${node.details.title} > ${group.category} > ${section.title} > ${product.part}`
          const placement = `${group.category}\0${section.title}\0${product.part}`

          if (seenPlacements.has(placement)) {
            failures.push(`${location}: duplicate product placement`)
          }
          seenPlacements.add(placement)

          const productUrl = product.links?.html
          const datasheetUrl = product.links?.datasheet
          if (!productUrl) {
            failures.push(`${location}: missing TI product URL`)
          } else {
            validateTiUrl(productUrl, `${location}: product URL`)
            if (
              finalPathSegment(productUrl).toUpperCase() !==
              product.part.toUpperCase()
            ) {
              failures.push(
                `${location}: product label does not match ${productUrl}`,
              )
            }
          }

          if (!datasheetUrl) {
            failures.push(`${location}: missing TI datasheet URL`)
          } else {
            validateTiUrl(datasheetUrl, `${location}: datasheet URL`)
            if (
              finalPathSegment(datasheetUrl).toUpperCase() !==
              product.part.toUpperCase()
            ) {
              failures.push(
                `${location}: datasheet does not match the displayed part`,
              )
            }
          }
        }
      }
    }

    for (const reference of node.details?.referenceDesigns ?? []) {
      const location = `${jsonFile}: ${node.details.title} > ${reference.name}`
      validateTiUrl(reference.url, `${location}: reference design URL`)
      if (reference.links?.designGuide) {
        validateTiUrl(
          reference.links.designGuide,
          `${location}: design guide URL`,
        )
      }
      if (reference.links?.schematic) {
        validateTiUrl(reference.links.schematic, `${location}: schematic URL`)
      }
    }

    for (const document of node.details?.technicalDocuments ?? []) {
      technicalDocumentCount += 1
      const location = `${jsonFile}: ${node.details.title} > ${document.title}`
      const identifier =
        document.literatureNumber ?? `${document.type}\0${document.title}`

      if (seenTechnicalDocuments.has(identifier)) {
        failures.push(`${location}: duplicate technical document`)
      }
      seenTechnicalDocuments.add(identifier)

      if (!document.title || !document.type) {
        failures.push(`${location}: missing document title or type`)
      }

      const pdfUrl = document.links?.pdf
      const htmlUrl = document.links?.html
      if (!pdfUrl && !htmlUrl) {
        failures.push(`${location}: missing PDF and HTML URLs`)
      }
      if (pdfUrl) validateTiUrl(pdfUrl, `${location}: PDF URL`)
      if (htmlUrl) validateTiUrl(htmlUrl, `${location}: HTML URL`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"))
  process.exitCode = 1
} else {
  console.log(
    `Validated ${jsonFiles.length} diagram definition(s), ${productCount} TI product recommendation(s), and ${technicalDocumentCount} technical document(s).`,
  )
}
