import { SysBlockDiagram } from "lib/SysBlockDiagram"
import { thermostatSmartThermostat } from "lib/generated/catalog"

export default function ThermostatSmartThermostatPage() {
  return <SysBlockDiagram definition={thermostatSmartThermostat} />
}
