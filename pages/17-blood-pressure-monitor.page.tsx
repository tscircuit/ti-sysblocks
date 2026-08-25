import { SysBlockDiagram } from "lib/SysBlockDiagram"
import { bloodPressureMonitor } from "lib/generated/catalog"

export default function BloodPressureMonitorPage() {
  return <SysBlockDiagram definition={bloodPressureMonitor} />
}
