import { SysBlockDiagram } from "lib/SysBlockDiagram"
import { centralInverter } from "lib/generated/catalog"

export default function CentralInverterPage() {
  return <SysBlockDiagram definition={centralInverter} />
}
