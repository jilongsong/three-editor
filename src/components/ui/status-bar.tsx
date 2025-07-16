import { useEditorStore } from "@/stores/editor-store"
import illustrateCard  from '@/components/ui/illustrate-card'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Info } from 'lucide-react';

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
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1 rounded hover:bg-muted transition-colors" title="操作说明">
              <Info className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end">
            {illustrateCard()}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
