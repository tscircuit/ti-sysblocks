import { SysBlockDiagram } from "lib/SysBlockDiagram"
import { powerBank } from "lib/generated/catalog"

export default function PowerBankPage() {
  return <SysBlockDiagram definition={powerBank} />
}
