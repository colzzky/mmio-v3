export interface ContextMenuItemType {
  label: string
  subitems?: ContextMenuItemType[]
  handler: (event: any) => void
  key: string
}

export interface ContextMenuRenderContext {
  type: string
  data: {
    type: string
    payload: null
    element: Record<string, any>,
    items: ContextMenuItemType[],
    searchBar: boolean,
    onHide: () => void,
    delay: number
  }
}
