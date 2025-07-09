"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, FileImage, Save, FolderOpen } from "lucide-react"
import { useEditorStore } from "@/stores/editor-store"
import { downloadJSON, uploadJSON, captureCanvas } from "@/utils/file-utils"

export function ImportExportMenu() {
  const { exportScene, importScene, clearScene } = useEditorStore()
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [sceneName, setSceneName] = useState("my-scene")

  const handleExport = () => {
    const sceneData = exportScene()
    sceneData.metadata.name = sceneName
    downloadJSON(sceneData, `${sceneName}.json`)
    setIsExportDialogOpen(false)
  }

  const handleImport = async () => {
    try {
      const data = await uploadJSON()
      importScene(data)
    } catch (error) {
      console.error("Failed to import scene:", error)
      alert("Failed to import scene. Please check the file format.")
    }
  }

  const handleRender = () => {
    // Get the canvas element
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const dataURL = captureCanvas(canvas)
      const link = document.createElement("a")
      link.href = dataURL
      link.download = `${sceneName}-render.png`
      link.click()
    }
  }

  const handleClearScene = () => {
    if (confirm("Are you sure you want to clear the scene? This action cannot be undone.")) {
      clearScene()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" title="File Operations">
            <Save className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export Scene
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import Scene
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleRender}>
            <FileImage className="w-4 h-4 mr-2" />
            Render Image
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleClearScene} className="text-destructive">
            <FolderOpen className="w-4 h-4 mr-2" />
            Clear Scene
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Scene</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="scene-name">Scene Name</Label>
              <Input
                id="scene-name"
                value={sceneName}
                onChange={(e) => setSceneName(e.target.value)}
                placeholder="Enter scene name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport}>Export</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
