"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Box,
  SpaceIcon as Sphere,
  Cylinder,
  Cone,
  Square,
  Circle,
  Package,
  Hexagon,
  Triangle,
  Diamond,
  Octagon,
  Pentagon,
} from "lucide-react"
import { useEditorStore } from "@/stores/editor-store"
import { AddObjectCommand } from "@/commands/object-commands"
import { ModelUpload } from "@/components/ui/model-upload"
import type { SceneObject, ObjectType, UploadedModel } from "@/types"

const BASIC_SHAPES: Array<{
  type: ObjectType
  label: string
  icon: React.ComponentType<{ className?: string }>
  category: "basic"
}> = [
  { type: "box", label: "Cube", icon: Box, category: "basic" },
  { type: "sphere", label: "Sphere", icon: Sphere, category: "basic" },
  { type: "cylinder", label: "Cylinder", icon: Cylinder, category: "basic" },
  { type: "cone", label: "Cone", icon: Cone, category: "basic" },
  { type: "plane", label: "Plane", icon: Square, category: "basic" },
  { type: "torus", label: "Torus", icon: Circle, category: "basic" },
]

const ADVANCED_SHAPES: Array<{
  type: ObjectType
  label: string
  icon: React.ComponentType<{ className?: string }>
  category: "advanced"
}> = [
  { type: "dodecahedron", label: "Dodecahedron", icon: Pentagon, category: "advanced" },
  { type: "icosahedron", label: "Icosahedron", icon: Diamond, category: "advanced" },
  { type: "octahedron", label: "Octahedron", icon: Octagon, category: "advanced" },
  { type: "tetrahedron", label: "Tetrahedron", icon: Triangle, category: "advanced" },
  { type: "ring", label: "Ring", icon: Circle, category: "advanced" },
  { type: "capsule", label: "Capsule", icon: Cylinder, category: "advanced" },
]

const SPECIAL_SHAPES: Array<{
  type: ObjectType
  label: string
  icon: React.ComponentType<{ className?: string }>
  category: "special"
}> = [
  { type: "tube", label: "Tube", icon: Cylinder, category: "special" },
  { type: "pyramid", label: "Pyramid", icon: Triangle, category: "special" },
  { type: "prism", label: "Prism", icon: Hexagon, category: "special" },
]

export function ToolsPanel() {
  const { executeCommand, uploadedModels } = useEditorStore()

  const createObject = (type: ObjectType, modelUrl?: string) => {
    const object: SceneObject = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${Date.now()}`,
      type,
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      material: {
        color: "#4F46E5",
        roughness: 0.7,
        metalness: 0.1,
        opacity: 1,
      },
      visible: true,
      locked: false,
      modelUrl,
      animations: [],
    }

    const command = new AddObjectCommand(object)
    executeCommand(command)
  }

  const createModelObject = (model: UploadedModel) => {
    createObject("model", model.url)
  }

  return (
    <Card>
      <CardContent className="flex flex-col h-full">
        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {/* Basic Shapes */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Basic Shapes</h4>
              <div className="grid grid-cols-2 gap-2">
                {BASIC_SHAPES.map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-12 flex-col gap-1 bg-transparent hover:bg-primary/10"
                    onClick={() => createObject(type)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Advanced Shapes */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Polyhedrons</h4>
              <div className="grid grid-cols-2 gap-2">
                {ADVANCED_SHAPES.map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-12 flex-col gap-1 bg-transparent hover:bg-secondary/80"
                    onClick={() => createObject(type)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Special Shapes */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Special Shapes</h4>
              <div className="grid grid-cols-2 gap-2">
                {SPECIAL_SHAPES.map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-12 flex-col gap-1 bg-transparent hover:bg-accent/80"
                    onClick={() => createObject(type)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <Separator />

            {/* 3D Models */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">3D Models</h4>
              <ModelUpload />

              {uploadedModels.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedModels.map((model) => (
                    <Button
                      key={model.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left bg-transparent hover:bg-muted/50"
                      onClick={() => createModelObject(model)}
                    >
                      <Package className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{model.name}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Quick Stats */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground text-center">
            {BASIC_SHAPES.length + ADVANCED_SHAPES.length + SPECIAL_SHAPES.length} built-in shapes
            {uploadedModels.length > 0 && ` • ${uploadedModels.length} custom models`}
            <br />
            HTML Widgets available
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
