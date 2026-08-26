export interface SysBlockProductLinks {
  datasheet?: string
  html?: string
  schematic?: string
}

export interface SysBlockProduct {
  part: string
  description: string
  links?: SysBlockProductLinks
}

export interface SysBlockProductSection {
  title: string
  products: SysBlockProduct[]
}

export interface SysBlockProductGroup {
  title: string
  sections: SysBlockProductSection[]
}

export interface SysBlockReferenceDesign {
  name: string
  description: string
  url: string
  links?: {
    designGuide?: string
    schematic?: string
  }
}

export interface SysBlockTechnicalDocument {
  literatureNumber?: string
  title: string
  type: string
  date?: string
  links?: {
    pdf?: string
    html?: string
  }
}

export interface SysBlockDetails {
  title: string
  description: string
  groups: SysBlockProductGroup[]
  references?: SysBlockReferenceDesign[]
  technicalDocuments?: SysBlockTechnicalDocument[]
}

export interface SysBlockDefinition {
  id: string
  title: string
  svg: string
  defaultSelected: string
  sourceUrl?: string
  blocks: Record<string, SysBlockDetails>
}

export interface SysBlockDiagramProps {
  definition: SysBlockDefinition
  className?: string
  initialSelectedId?: string
  onSelectionChange?: (blockId: string, details: SysBlockDetails) => void
}
