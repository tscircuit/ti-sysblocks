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

## Diagram catalog

The catalog follows the [tscircuit handbook's visualizer convention](https://github.com/tscircuit/handbook/blob/main/guides/bootstrapping-repos.md): each diagram is a separate `pages/*.page.tsx` Cosmos page.

```sh
bun install
bun run start
```

Cosmos lists every solution and variant independently in its sidebar. The catalog converts ten TI solution pages into sixteen diagram pages:

- Machine vision camera
- Drive line components (three variants)
- Central inverter
- Battery charger (three variants)
- Thermostat (two variants)
- Industrial AC/DC (two variants)
- Power bank
- Seat position module
- Rearview mirror module
- Window module

## Add another TI solution

1. Add its `{ slug, title }` entry to `solutions` in `scripts/generate-ti-diagrams.ts`.
2. Run `bun run generate`.
3. Run `bun run build` to validate SVG group IDs and typecheck the catalog.

Run `bun run audit:ti` at any time to refresh from TI and fail if the checked-in
chip recommendations differ from TI's current solution data. The regular
validator also checks that every displayed part name matches its TI product and
datasheet URLs, and rejects missing or duplicate recommendations.

The generator reads TI's embedded solution model, preserves its original SVG geometry, converts products and documents to the JSON format, assigns stable interactive SVG group IDs, and creates one Cosmos page per variant.

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

`bun run validate:diagrams` verifies that every selectable JSON node has a matching SVG group ID.

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
bun install
bun run start
bun run build
bun run build:site
```

## License

MIT
