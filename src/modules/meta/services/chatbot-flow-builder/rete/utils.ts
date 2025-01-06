import type { MetaTemplateOutput, NodeType } from '@/modules/meta/utils/flow-types'
import type { Input, Output, Socket } from 'rete/_types/presets/classic'

export function sortByIndex<T extends Output<Socket> | Input<Socket> | MetaTemplateOutput>(
  entries: [string, T | undefined][],
) {
  return entries.sort((a, b) => {
    const ai = a[1]?.index || 0
    const bi = b[1]?.index || 0
    return ai - bi
  })
}

export function dispatchTriggerNodeSheetEvent(args: { id: string; label: keyof NodeType }) {
  document.dispatchEvent(
    new CustomEvent('triggerNodeSheet', {
      detail: args,
    }),
  )
}
