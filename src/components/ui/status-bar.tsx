import { useEditorStore } from "@/stores/editor-store"
import illustrateCard  from '@/components/ui/illustrate-card'

export function StatusBar() {
  const { objects, selectedObjects, transformMode, isTransforming } = useEditorStore()

  const objectCount = Object.keys(objects).length
  const selectedCount = selectedObjects.length

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-t text-sm text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>Objects: {objectCount}</span>
        <span>Selected: {selectedCount}</span>
        <span>Mode: {transformMode}</span>
        {isTransforming && <span className="text-primary font-medium">• Transforming</span>}
      </div>

      <div className="flex items-center gap-4">
        <span>{isTransforming ? "Transforming..." : "Ready"}</span>
      </div>
    </div>
  )
}
