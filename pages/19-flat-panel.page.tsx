import { SysBlockDiagram } from "lib/SysBlockDiagram"
import { flatPanel } from "lib/generated/catalog"

export default function FlatPanelPage() {
  return <SysBlockDiagram definition={flatPanel} />
}
