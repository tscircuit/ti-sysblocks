import { mkdir, rm } from "node:fs/promises"
import path from "node:path"

interface TiSolution {
  slug: string
  title: string
  variantId?: number
  subsystemId?: number
}

const solutions = [
  { slug: "machine-vision-camera", title: "Machine vision camera" },
  { slug: "drive-line-components", title: "Drive line components" },
  { slug: "central-inverter", title: "Central inverter" },
  { slug: "battery-charger", title: "Battery charger" },
  { slug: "thermostat", title: "Thermostat" },
  { slug: "industrial-ac-dc", title: "Industrial AC/DC" },
  {
    slug: "power-bank",
    title: "Power bank",
    variantId: 34201,
    subsystemId: 27662,
  },
  {
    slug: "seat-position-module",
    title: "Seat position module",
    variantId: 18223,
    subsystemId: 26708,
  },
] as const satisfies readonly TiSolution[]

interface TiDocument {
  docSubType?: string | null
  documentType?: string | null
  literatureUrl?: string | null
}

interface TiPanelItem {
  name: string
  url: string
  description: string
  documents?: TiDocument[]
}

interface TiProductFamily {
  subFamilyName: string
  products: TiPanelItem[]
}

interface TiSubsystem {
  subSystemId: number
  subSystemName: string
  subSystemDesc: string
  subSystemEERDGroup: string
  defaultSubSystem: boolean
  referenceDesigns: TiPanelItem[]
  products: Record<string, TiProductFamily[]>
}

interface TiVariant {
  eeqId: number
  eeqName: string
  defaultVariantFlag: boolean
  svg: string
  subsystems: TiSubsystem[]
}

const root = path.resolve(import.meta.dirname, "..")
const generatedDirectory = path.join(root, "lib", "generated")
const pagesDirectory = path.join(root, "pages")

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const absoluteTiUrl = (url?: string | null) => {
  if (!url) return undefined
  return new URL(url, "https://www.ti.com").href
}

const xmlAttribute = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

const plainText = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&plusmn;", "±")
    .replaceAll("&deg;", "°")
    .replaceAll("&micro;", "µ")
    .replaceAll("&sup2;", "²")
    .replaceAll("&sup3;", "³")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/\s+/g, " ")
    .trim()

function extractVariants(html: string): TiVariant[] {
  const startMarker = "const VARIANT_LIST = "
  const endMarker = ";\n      /** @type {number} */\n      const VARIANT_COUNT"
  const start = html.indexOf(startMarker)
  const end = html.indexOf(endMarker, start)

  if (start < 0 || end < 0) {
    throw new Error("Could not find TI's embedded VARIANT_LIST model")
  }

  return JSON.parse(html.slice(start + startMarker.length, end))
}

function prepareSvg(variant: TiVariant) {
  let svg = variant.svg
    .replace(/^<\?xml[^>]*>\s*/i, "")
    .replace(/^<!DOCTYPE[^>]*>\s*/i, "")

  for (const subsystem of variant.subsystems) {
    const originalId = `id="${subsystem.subSystemEERDGroup}"`
    const interactiveId = `id="subsystemid-${subsystem.subSystemId}" aria-label="${xmlAttribute(subsystem.subSystemName)}"`
    svg = svg.replace(originalId, interactiveId)
  }

  return svg
}

function convertSubsystem(subsystem: TiSubsystem) {
  return {
    id: `subsystemid-${subsystem.subSystemId}`,
    details: {
      title: subsystem.subSystemName,
      description: plainText(subsystem.subSystemDesc),
      productGroups: Object.entries(subsystem.products ?? {}).map(
        ([category, families]) => ({
          category,
          sections: families.map((family) => ({
            title: family.subFamilyName,
            products: family.products.map((product) => {
              const datasheet = product.documents?.find(
                (document) => document.documentType === "Data sheet",
              )
              return {
                part: product.name,
                description: plainText(product.description),
                links: {
                  datasheet: absoluteTiUrl(datasheet?.literatureUrl),
                  html: absoluteTiUrl(product.url),
                },
              }
            }),
          })),
        }),
      ),
      referenceDesigns: (subsystem.referenceDesigns ?? []).map((reference) => {
        const designGuide = reference.documents?.find(
          (document) => document.docSubType === "Design guide",
        )
        const schematic = reference.documents?.find(
          (document) => document.docSubType === "Schematic",
        )
        return {
          name: reference.name,
          description: plainText(reference.description),
          url: absoluteTiUrl(reference.url)!,
          links: {
            designGuide: absoluteTiUrl(designGuide?.literatureUrl),
            schematic: absoluteTiUrl(schematic?.literatureUrl),
          },
        }
      }),
    },
  }
}

await rm(generatedDirectory, { recursive: true, force: true })
await rm(pagesDirectory, { recursive: true, force: true })
await mkdir(generatedDirectory, { recursive: true })
await mkdir(pagesDirectory, { recursive: true })

const generated: Array<{
  id: string
  exportName: string
  title: string
}> = []

for (const solution of solutions) {
  const sourceUrl = new URL(`https://www.ti.com/solution/${solution.slug}`)
  if ("variantId" in solution) {
    sourceUrl.searchParams.set("variantid", String(solution.variantId))
  }
  if ("subsystemId" in solution) {
    sourceUrl.searchParams.set("subsystemid", String(solution.subsystemId))
  }

  const response = await fetch(sourceUrl)
  if (!response.ok)
    throw new Error(`${response.status} while fetching ${sourceUrl}`)
  const allVariants = extractVariants(await response.text())
  const variants =
    "variantId" in solution
      ? allVariants.filter((variant) => variant.eeqId === solution.variantId)
      : allVariants

  if (variants.length === 0) {
    throw new Error(`Could not find requested variant for ${sourceUrl}`)
  }

  for (const variant of variants) {
    const suffix = variants.length > 1 ? `-${slugify(variant.eeqName)}` : ""
    const id = `${solution.slug}${suffix}`
    const title =
      variants.length > 1
        ? `${solution.title} — ${variant.eeqName}`
        : solution.title
    const exportName = id.replace(/-([a-z0-9])/g, (_, letter: string) =>
      letter.toUpperCase(),
    )
    const defaultSubsystem =
      ("subsystemId" in solution
        ? variant.subsystems.find(
            (subsystem) => subsystem.subSystemId === solution.subsystemId,
          )
        : undefined) ??
      variant.subsystems.find((subsystem) => subsystem.defaultSubSystem) ??
      variant.subsystems[0]

    if (!defaultSubsystem) continue

    const json = {
      title,
      sourceUrl: sourceUrl.href,
      defaultSelected: `subsystemid-${defaultSubsystem.subSystemId}`,
      nodes: variant.subsystems.map(convertSubsystem),
    }

    await Bun.write(
      path.join(generatedDirectory, `${id}.svg`),
      prepareSvg(variant),
    )
    await Bun.write(
      path.join(generatedDirectory, `${id}.json`),
      `${JSON.stringify(json, null, 2)}\n`,
    )
    generated.push({ id, exportName, title })
  }
}

const imports = generated
  .map(
    ({ id }, index) =>
      `import diagram${index}Svg from "./${id}.svg?raw"\nimport diagram${index}Json from "./${id}.json"`,
  )
  .join("\n")
const definitions = generated
  .map(
    ({ id, exportName }, index) =>
      `export const ${exportName} = createSysBlockDefinitionFromJson("${id}", diagram${index}Svg, diagram${index}Json)`,
  )
  .join("\n")
const catalogEntries = generated.map(({ exportName }) => exportName).join(", ")

await Bun.write(
  path.join(generatedDirectory, "catalog.ts"),
  `import { createSysBlockDefinitionFromJson } from "../create-sysblock-definition-from-json"\n${imports}\n\n${definitions}\n\nexport const generatedDiagrams = [${catalogEntries}]\n`,
)

for (const [index, diagram] of generated.entries()) {
  const order = String(index + 1).padStart(2, "0")
  await Bun.write(
    path.join(pagesDirectory, `${order}-${diagram.id}.page.tsx`),
    `import { SysBlockDiagram } from "lib/SysBlockDiagram"\nimport { ${diagram.exportName} } from "lib/generated/catalog"\n\nexport default function ${diagram.exportName[0].toUpperCase()}${diagram.exportName.slice(1)}Page() {\n  return <SysBlockDiagram definition={${diagram.exportName}} />\n}\n`,
  )
}

console.log(
  `Generated ${generated.length} Cosmos diagram page(s) from ${solutions.length} TI solutions.`,
)
