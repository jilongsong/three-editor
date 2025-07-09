"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Trash2, Package } from "lucide-react"
import { useEditorStore } from "@/stores/editor-store"
import { uploadModel } from "@/utils/file-utils"
import type { UploadedModel } from "@/types"

export function ModelUpload() {
  const { uploadedModels, addUploadedModel, removeUploadedModel } = useEditorStore()
  const [isUploading, setIsUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleUpload = async () => {
    try {
      setIsUploading(true)
      const { file, url } = await uploadModel()

      const model: UploadedModel = {
        id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: file.name.replace(/\.(glb|gltf)$/i, ""),
        url,
        uploadedAt: new Date().toISOString(),
      }

      addUploadedModel(model)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to upload model:", error)
      alert("Failed to upload model. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <Upload className="w-4 h-4 mr-2" />
            Upload Model
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload 3D Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Supported formats: GLB, GLTF</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Choose File"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {uploadedModels.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              Uploaded Models ({uploadedModels.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {uploadedModels.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{model.name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(model.uploadedAt).toLocaleDateString()}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadedModel(model.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  )
}
