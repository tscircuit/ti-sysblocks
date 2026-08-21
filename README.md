# @tscircuit/ti-sysblocks

Reusable React components for interactive Texas Instruments-style system block diagrams.

The diagram geometry remains SVG. Product data, reference designs, selection state, tabs, accordions, and the details panel are rendered as accessible React/HTML.

## Install

```sh
npm install @tscircuit/ti-sysblocks
```

## Use

```tsx
import {
  SysBlockDiagram,
  machineVisionCamera,
} from "@tscircuit/ti-sysblocks"
import "@tscircuit/ti-sysblocks/style.css"

export function CameraDiagram() {
  return <SysBlockDiagram definition={machineVisionCamera} />
}
```

## Add another TI diagram

1. Copy the diagram-only SVG into `src/diagrams/`.
2. Give each selectable SVG group a stable `id`, such as `<g id="sensing">`.
3. Add a JSON file whose node IDs match those SVG group IDs.
4. Combine the two files with `createSysBlockDefinitionFromJson`.
5. Export the definition from `src/index.ts` and add it to the demo.

The important mapping is:

```text
SVG:  <g id="sensing">
JSON: nodes[].id === "sensing"
```

The adapter stays the same for every diagram:

```ts
import svg from "./new-diagram.svg?raw"
import json from "./new-diagram.json"
import { createSysBlockDefinitionFromJson } from "../create-sysblock-definition-from-json"

export const newDiagram = createSysBlockDefinitionFromJson("new-diagram", svg, json)
```

`npm run validate:diagrams` verifies that the selectable IDs in each JSON file exist as SVG group IDs.

## Definition shape

```ts
const definition = defineSysBlockDiagram({
  id: "machine-vision-camera",
  title: "Machine vision camera",
  svg: machineVisionCameraSvg,
  defaultSelected: "sensing",
  blocks: {
    sensing: {
      title: "Sensing",
      description: "Monitor temperature and humidity.",
      groups: [
        {
          title: "Sensors",
          sections: [
            {
              title: "Digital temperature sensors",
              products: [
                {
                  part: "TMP102",
                  description: "Digital temperature sensor",
                  links: {
                    datasheet: "https://example.com/datasheet.pdf",
                    html: "https://example.com/product",
                    schematic: "https://example.com/schematic",
                  },
                },
              ],
            },
          ],
        },
      ],
      references: [],
    },
  },
})
```

## Development

```sh
npm install
npm run dev
npm run build
```

## License

MIT
