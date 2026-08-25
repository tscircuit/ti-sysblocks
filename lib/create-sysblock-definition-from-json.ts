import { defineSysBlockDiagram } from "./define-sysblock-diagram"
import type {
  SysBlockDefinition,
  SysBlockProductGroup,
  SysBlockReferenceDesign,
  SysBlockTechnicalDocument,
} from "./types"

export interface SysBlockJsonProduct {
  part: string
  description: string
  links?: {
    datasheet?: string
    html?: string
    schematic?: string
  }
}

export interface SysBlockJsonNode {
  id: string
  details: {
    title: string
    description: string
    productGroups: Array<{
      category: string
      sections: Array<{
        title: string
        products: SysBlockJsonProduct[]
      }>
    }>
    referenceDesigns?: SysBlockReferenceDesign[]
    technicalDocuments?: SysBlockTechnicalDocument[]
  }
}

export interface SysBlockDiagramJson {
  title: string
  sourceUrl?: string
  defaultSelected: string
  nodes: SysBlockJsonNode[]
}

/** Combines trusted SVG markup with its matching JSON content definition. */
export function createSysBlockDefinitionFromJson(
  id: string,
  svg: string,
  source: SysBlockDiagramJson,
): SysBlockDefinition {
  return defineSysBlockDiagram({
    id,
    title: source.title,
    sourceUrl: source.sourceUrl,
    svg,
    defaultSelected: source.defaultSelected,
    blocks: Object.fromEntries(
      source.nodes.map((node) => [
        node.id,
        {
          title: node.details.title,
          description: node.details.description,
          groups: node.details.productGroups.map(
            (group): SysBlockProductGroup => ({
              title: group.category,
              sections: group.sections,
            }),
          ),
          references: node.details.referenceDesigns ?? [],
          technicalDocuments: node.details.technicalDocuments ?? [],
        },
      ]),
    ),
  })
}
