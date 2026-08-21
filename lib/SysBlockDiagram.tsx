import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type {
  SysBlockDetails,
  SysBlockDiagramProps,
  SysBlockProductLinks,
} from "./types"
import "./SysBlockDiagram.css"

type DetailsTab = "products" | "references"

const SVG_NAMESPACE = "http://www.w3.org/2000/svg"

const findSvgBlock = (root: SVGSVGElement, id: string): SVGGElement | null => {
  const element = Array.from(root.querySelectorAll<SVGGElement>("g[id]")).find(
    (group) => group.id === id,
  )
  return element ?? null
}

type SvgBounds = Pick<DOMRect, "x" | "y" | "width" | "height">

const getSvgBounds = (
  svgRoot: SVGSVGElement,
  element: SVGGElement,
): SvgBounds | null => {
  if (typeof element.getBBox === "function") return element.getBBox()

  const screenMatrix = svgRoot.getScreenCTM()
  if (!screenMatrix) return null

  const screenBounds = element.getBoundingClientRect()
  const inverseMatrix = screenMatrix.inverse()
  const topLeft = new DOMPoint(
    screenBounds.left,
    screenBounds.top,
  ).matrixTransform(inverseMatrix)
  const bottomRight = new DOMPoint(
    screenBounds.right,
    screenBounds.bottom,
  ).matrixTransform(inverseMatrix)

  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  }
}

function ProductLinks({ links }: { links?: SysBlockProductLinks }) {
  if (!links) return null

  const entries = [
    ["Data sheet: PDF", links.datasheet],
    ["HTML", links.html],
    ["Schematic", links.schematic],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))

  return (
    <div className="ti-sysblock__links">
      {entries.map(([label, href]) => (
        <span key={label}>
          <a href={href} target="_blank" rel="noreferrer">
            {label}
          </a>
        </span>
      ))}
    </div>
  )
}

function ProductsPanel({ details }: { details: SysBlockDetails }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())

  useEffect(() => setCollapsed(new Set()), [details])

  const toggleGroup = (groupTitle: string) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(groupTitle)) next.delete(groupTitle)
      else next.add(groupTitle)
      return next
    })
  }

  return (
    <>
      {details.groups.map((group) => {
        const productCount = group.sections.reduce(
          (total, section) => total + section.products.length,
          0,
        )
        const isCollapsed = collapsed.has(group.title)

        return (
          <section className="ti-sysblock__group" key={group.title}>
            <button
              className="ti-sysblock__group-toggle"
              type="button"
              aria-expanded={!isCollapsed}
              onClick={() => toggleGroup(group.title)}
            >
              <strong>
                {group.title} ({productCount})
              </strong>
              <span className={isCollapsed ? "is-collapsed" : ""}>⌃</span>
            </button>
            {!isCollapsed &&
              group.sections.map((section) => (
                <div className="ti-sysblock__section" key={section.title}>
                  <h3>{section.title}</h3>
                  {section.products.map((product) => (
                    <article
                      className="ti-sysblock__product"
                      key={product.part}
                    >
                      <p>
                        <a
                          href={product.links?.html ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {product.part}
                        </a>
                        <span className="ti-sysblock__dash">–</span>
                        {product.description}
                      </p>
                      <ProductLinks links={product.links} />
                    </article>
                  ))}
                </div>
              ))}
          </section>
        )
      })}
    </>
  )
}

function ReferencesPanel({ details }: { details: SysBlockDetails }) {
  const references = details.references ?? []

  if (references.length === 0) {
    return (
      <p className="ti-sysblock__empty-copy">
        No reference designs are listed for this block.
      </p>
    )
  }

  return (
    <>
      {references.map((reference) => (
        <article className="ti-sysblock__reference" key={reference.name}>
          <a href={reference.url} target="_blank" rel="noreferrer">
            {reference.name}
          </a>
          <p>{reference.description}</p>
          {reference.links && (
            <div className="ti-sysblock__links">
              {reference.links.designGuide && (
                <span>
                  <a
                    href={reference.links.designGuide}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Design guide: PDF
                  </a>
                </span>
              )}
              {reference.links.schematic && (
                <span>
                  <a
                    href={reference.links.schematic}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Schematic: PDF
                  </a>
                </span>
              )}
            </div>
          )}
        </article>
      ))}
    </>
  )
}

export function SysBlockDiagram({
  definition,
  className,
  initialSelectedId,
  onSelectionChange,
}: SysBlockDiagramProps) {
  const diagramHostRef = useRef<HTMLDivElement>(null)
  const detailsScrollRef = useRef<HTMLDivElement>(null)
  const initialId = initialSelectedId ?? definition.defaultSelected
  const [selectedId, setSelectedId] = useState(initialId)
  const [activeTab, setActiveTab] = useState<DetailsTab>("products")
  const [panelOpen, setPanelOpen] = useState(true)

  const selectedDetails = useMemo(
    () =>
      definition.blocks[selectedId] ??
      definition.blocks[definition.defaultSelected],
    [definition, selectedId],
  )

  const selectBlock = useCallback(
    (blockId: string) => {
      const details = definition.blocks[blockId]
      if (!details) return
      setSelectedId(blockId)
      setActiveTab("products")
      setPanelOpen(true)
      detailsScrollRef.current?.scrollTo({ top: 0 })
      onSelectionChange?.(blockId, details)
    },
    [definition.blocks, onSelectionChange],
  )

  useLayoutEffect(() => {
    const host = diagramHostRef.current
    if (!host) return

    const parsed = new DOMParser().parseFromString(
      definition.svg,
      "image/svg+xml",
    )
    const svgRoot = parsed.documentElement
    if (svgRoot.localName !== "svg") {
      throw new Error(`Invalid SVG supplied for ${definition.id}`)
    }

    host.replaceChildren(document.importNode(svgRoot, true))
    return () => host.replaceChildren()
  }, [definition.id, definition.svg])

  useEffect(() => {
    const nextId = initialSelectedId ?? definition.defaultSelected
    setSelectedId(nextId)
    setPanelOpen(true)
  }, [definition, initialSelectedId])

  useEffect(() => {
    const host = diagramHostRef.current
    const svgRoot = host?.querySelector<SVGSVGElement>("svg")
    if (!svgRoot) return

    const cleanups: Array<() => void> = []

    Object.entries(definition.blocks).forEach(([blockId, details]) => {
      const block = findSvgBlock(svgRoot, blockId)
      if (!block) return

      block.classList.add("ti-sysblock-svg-block")
      block.setAttribute("tabindex", "0")
      block.setAttribute("role", "button")
      block.setAttribute("aria-label", `Show ${details.title} details`)

      const handleClick = () => selectBlock(blockId)
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          selectBlock(blockId)
        }
      }

      block.addEventListener("click", handleClick)
      block.addEventListener("keydown", handleKeyDown)
      cleanups.push(() => {
        block.removeEventListener("click", handleClick)
        block.removeEventListener("keydown", handleKeyDown)
      })
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [definition.blocks, definition.svg, selectBlock])

  useEffect(() => {
    const svgRoot = diagramHostRef.current?.querySelector<SVGSVGElement>("svg")
    if (!svgRoot) return

    svgRoot
      .querySelectorAll(".select-outline, [data-ti-sysblock-selection]")
      .forEach((node) => node.remove())

    const selectedBlock = findSvgBlock(svgRoot, selectedId)
    if (!selectedBlock) return

    const bounds = getSvgBounds(svgRoot, selectedBlock)
    if (!bounds) return
    const outline = document.createElementNS(SVG_NAMESPACE, "rect")
    outline.setAttribute("x", String(bounds.x - 3))
    outline.setAttribute("y", String(bounds.y - 3))
    outline.setAttribute("width", String(bounds.width + 6))
    outline.setAttribute("height", String(bounds.height + 6))
    outline.setAttribute("fill", "none")
    outline.setAttribute("stroke", "#d50000")
    outline.setAttribute("stroke-width", "7")
    outline.setAttribute("pointer-events", "none")
    outline.setAttribute("data-ti-sysblock-selection", "true")
    svgRoot.appendChild(outline)
  }, [definition.svg, selectedId])

  const classes = ["ti-sysblock", className].filter(Boolean).join(" ")

  return (
    <section className={classes} aria-label={definition.title}>
      <header className="ti-sysblock__titlebar">
        <h1>{definition.title}</h1>
        {definition.sourceUrl && (
          <a href={definition.sourceUrl} target="_blank" rel="noreferrer">
            View source on TI.com
          </a>
        )}
      </header>
      <div className="ti-sysblock__workspace">
        <div className="ti-sysblock__diagram-host" ref={diagramHostRef} />
        <aside className="ti-sysblock__details" aria-live="polite">
          <button
            className="ti-sysblock__close"
            type="button"
            aria-label="Close details"
            onClick={() => setPanelOpen(false)}
          >
            ×
          </button>
          {!panelOpen ? (
            <p className="ti-sysblock__closed-copy">
              Select a diagram block to view its details.
            </p>
          ) : (
            <div className="ti-sysblock__details-scroll" ref={detailsScrollRef}>
              <header className="ti-sysblock__details-header">
                <h2>{selectedDetails.title}</h2>
                <p>{selectedDetails.description}</p>
              </header>
              <nav className="ti-sysblock__tabs" aria-label="Detail sections">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "products"}
                  className={activeTab === "products" ? "is-active" : ""}
                  onClick={() => setActiveTab("products")}
                >
                  Products
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "references"}
                  className={activeTab === "references" ? "is-active" : ""}
                  onClick={() => setActiveTab("references")}
                >
                  Reference designs
                </button>
              </nav>
              <div className="ti-sysblock__content">
                {activeTab === "products" ? (
                  <ProductsPanel key={selectedId} details={selectedDetails} />
                ) : (
                  <ReferencesPanel details={selectedDetails} />
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
