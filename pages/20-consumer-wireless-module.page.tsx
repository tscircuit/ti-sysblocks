import { SysBlockDiagram } from "lib/SysBlockDiagram"
import { consumerWirelessModule } from "lib/generated/catalog"

export default function ConsumerWirelessModulePage() {
  return <SysBlockDiagram definition={consumerWirelessModule} />
}
