"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Undo2, Redo2, Move, RotateCw, Scale, Copy, Trash2, Grid3X3, BarChart3 } from "lucide-react"
import { useEditorStore } from "@/stores/editor-store"
import { DeleteObjectCommand } from "@/commands/object-commands"
import { ImportExportMenu } from "./import-export-menu"

export function Toolbar() {
  const {
    transformMode,
    setTransformMode,
    selectedObjects,
    duplicateObjects,
    executeCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    showGrid,
    toggleGrid,
    showStats,
    toggleStats,
  } = useEditorStore()

  const handleDelete = () => {
    if (selectedObjects.length > 0) {
      const command = new DeleteObjectCommand(selectedObjects)
      executeCommand(command)
    }
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-card border-b">
      {/* File Operations */}
      <ImportExportMenu />

      <Separator orientation="vertical" className="h-6" />

      {/* History */}
      <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)">
        <Undo2 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Y)">
        <Redo2 className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Transform modes */}
      <Button
        variant={transformMode === "translate" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTransformMode("translate")}
        title="Move (G)"
      >
        <Move className="w-4 h-4" />
      </Button>
      <Button
        variant={transformMode === "rotate" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTransformMode("rotate")}
        title="Rotate (R)"
      >
        <RotateCw className="w-4 h-4" />
      </Button>
      <Button
        variant={transformMode === "scale" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTransformMode("scale")}
        title="Scale (S)"
      >
        <Scale className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Object operations */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => duplicateObjects(selectedObjects)}
        disabled={selectedObjects.length === 0}
        title="Duplicate (Ctrl+D)"
      >
        <Copy className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={selectedObjects.length === 0}
        title="Delete (Del)"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* View options */}
      <Button variant={showGrid ? "default" : "ghost"} size="sm" onClick={toggleGrid} title="Toggle Grid">
        <Grid3X3 className="w-4 h-4" />
      </Button>
      <Button variant={showStats ? "default" : "ghost"} size="sm" onClick={toggleStats} title="Toggle Stats">
        <BarChart3 className="w-4 h-4" />
      </Button>
    </div>
  )
}
