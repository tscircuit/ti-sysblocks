import machineVisionCameraSvg from "./machine-vision-camera.svg?raw"
import source from "./machine-vision-camera.json"
import { createSysBlockDefinitionFromJson } from "../create-sysblock-definition-from-json"

export const machineVisionCameraSource = source

export const machineVisionCamera = createSysBlockDefinitionFromJson(
  "machine-vision-camera",
  machineVisionCameraSvg,
  source,
)
