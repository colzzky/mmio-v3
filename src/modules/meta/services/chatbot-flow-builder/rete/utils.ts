import type { MeteTemplateOutput } from '@/core/utils/flow-types'
import type { Input, Output, Socket } from 'rete/_types/presets/classic'

export function sortByIndex<T extends Output<Socket> | Input<Socket> | MeteTemplateOutput>(
  entries: [string, T | undefined][],
) {
  return entries.sort((a, b) => {
    const ai = a[1]?.index || 0
    const bi = b[1]?.index || 0
    return ai - bi
  })
}
