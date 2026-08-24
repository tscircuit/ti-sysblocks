import { createSysBlockDefinitionFromJson } from "../create-sysblock-definition-from-json"
import diagram0Svg from "./machine-vision-camera.svg?raw"
import diagram0Json from "./machine-vision-camera.json"
import diagram1Svg from "./drive-line-components-active-transfer-case.svg?raw"
import diagram1Json from "./drive-line-components-active-transfer-case.json"
import diagram2Svg from "./drive-line-components-fluid-pump.svg?raw"
import diagram2Json from "./drive-line-components-fluid-pump.json"
import diagram3Svg from "./drive-line-components-torque-converter.svg?raw"
import diagram3Json from "./drive-line-components-torque-converter.json"
import diagram4Svg from "./central-inverter.svg?raw"
import diagram4Json from "./central-inverter.json"
import diagram5Svg from "./battery-charger-appliance-battery-chargers.svg?raw"
import diagram5Json from "./battery-charger-appliance-battery-chargers.json"
import diagram6Svg from "./battery-charger-wireless-battery-pack-chargers.svg?raw"
import diagram6Json from "./battery-charger-wireless-battery-pack-chargers.json"
import diagram7Svg from "./battery-charger-industrial-battery-chargers.svg?raw"
import diagram7Json from "./battery-charger-industrial-battery-chargers.json"
import diagram8Svg from "./thermostat-basic-thermostat.svg?raw"
import diagram8Json from "./thermostat-basic-thermostat.json"
import diagram9Svg from "./thermostat-smart-thermostat.svg?raw"
import diagram9Json from "./thermostat-smart-thermostat.json"
import diagram10Svg from "./industrial-ac-dc-digital-controlled-industrial-ac-dc.svg?raw"
import diagram10Json from "./industrial-ac-dc-digital-controlled-industrial-ac-dc.json"
import diagram11Svg from "./industrial-ac-dc-analog-controlled-industrial-ac-dc.svg?raw"
import diagram11Json from "./industrial-ac-dc-analog-controlled-industrial-ac-dc.json"
import diagram12Svg from "./power-bank.svg?raw"
import diagram12Json from "./power-bank.json"
import diagram13Svg from "./seat-position-module.svg?raw"
import diagram13Json from "./seat-position-module.json"

export const machineVisionCamera = createSysBlockDefinitionFromJson("machine-vision-camera", diagram0Svg, diagram0Json)
export const driveLineComponentsActiveTransferCase = createSysBlockDefinitionFromJson("drive-line-components-active-transfer-case", diagram1Svg, diagram1Json)
export const driveLineComponentsFluidPump = createSysBlockDefinitionFromJson("drive-line-components-fluid-pump", diagram2Svg, diagram2Json)
export const driveLineComponentsTorqueConverter = createSysBlockDefinitionFromJson("drive-line-components-torque-converter", diagram3Svg, diagram3Json)
export const centralInverter = createSysBlockDefinitionFromJson("central-inverter", diagram4Svg, diagram4Json)
export const batteryChargerApplianceBatteryChargers = createSysBlockDefinitionFromJson("battery-charger-appliance-battery-chargers", diagram5Svg, diagram5Json)
export const batteryChargerWirelessBatteryPackChargers = createSysBlockDefinitionFromJson("battery-charger-wireless-battery-pack-chargers", diagram6Svg, diagram6Json)
export const batteryChargerIndustrialBatteryChargers = createSysBlockDefinitionFromJson("battery-charger-industrial-battery-chargers", diagram7Svg, diagram7Json)
export const thermostatBasicThermostat = createSysBlockDefinitionFromJson("thermostat-basic-thermostat", diagram8Svg, diagram8Json)
export const thermostatSmartThermostat = createSysBlockDefinitionFromJson("thermostat-smart-thermostat", diagram9Svg, diagram9Json)
export const industrialAcDcDigitalControlledIndustrialAcDc = createSysBlockDefinitionFromJson("industrial-ac-dc-digital-controlled-industrial-ac-dc", diagram10Svg, diagram10Json)
export const industrialAcDcAnalogControlledIndustrialAcDc = createSysBlockDefinitionFromJson("industrial-ac-dc-analog-controlled-industrial-ac-dc", diagram11Svg, diagram11Json)
export const powerBank = createSysBlockDefinitionFromJson("power-bank", diagram12Svg, diagram12Json)
export const seatPositionModule = createSysBlockDefinitionFromJson("seat-position-module", diagram13Svg, diagram13Json)

export const generatedDiagrams = [machineVisionCamera, driveLineComponentsActiveTransferCase, driveLineComponentsFluidPump, driveLineComponentsTorqueConverter, centralInverter, batteryChargerApplianceBatteryChargers, batteryChargerWirelessBatteryPackChargers, batteryChargerIndustrialBatteryChargers, thermostatBasicThermostat, thermostatSmartThermostat, industrialAcDcDigitalControlledIndustrialAcDc, industrialAcDcAnalogControlledIndustrialAcDc, powerBank, seatPositionModule]
