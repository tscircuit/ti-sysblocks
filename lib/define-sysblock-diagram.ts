import type { SysBlockDefinition } from "./types"

export const defineSysBlockDiagram = <T extends SysBlockDefinition>(
  definition: T,
): T => definition
