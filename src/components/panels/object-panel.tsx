"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Lock, Unlock, Trash2, Info, Maximize2, Link, Unlink } from "lucide-react"
import { useEditorStore } from "@/stores/editor-store"
import { DeleteObjectCommand } from "@/commands/object-commands"
import { AnimationPanel } from "./animation-panel"
import { WidgetPanel } from "./widget-panel"
import { getObjectDimensions } from "@/utils/animation-utils"
import type { SceneObject } from "@/types"
import { useState } from "react"

// Object type descriptions for better UX
const OBJECT_DESCRIPTIONS: Record<string, string> = {
  box: "Basic cube geometry",
  sphere: "Perfect sphere with customizable segments",
  cylinder: "Cylindrical shape with circular cross-section",
  cone: "Conical shape tapering to a point",
  plane: "Flat rectangular surface",
  torus: "Donut-shaped ring geometry",
  dodecahedron: "12-faced polyhedron with pentagonal faces",
  icosahedron: "20-faced polyhedron with triangular faces",
  octahedron: "8-faced polyhedron with triangular faces",
  tetrahedron: "4-faced polyhedron (triangular pyramid)",
  ring: "Flat circular ring with inner and outer radius",
  capsule: "Pill-shaped geometry with rounded ends",
  tube: "Curved tubular geometry along a path",
  pyramid: "Square-based pyramid",
  prism: "Hexagonal prism with flat ends",
  model: "Custom 3D model from uploaded file",
  htmlWidget: "Interactive HTML widget with custom content",
}

export function ObjectPanel() {
  const { objects, selectedObjects, updateObject } = useEditorStore()

  if (selectedObjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Info className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Select an object to view and edit its properties</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (selectedObjects.length === 1) {
    const object = objects[selectedObjects[0]]
    return <SingleObjectPanel object={object} onUpdate={updateObject} />
  }

  return <MultiObjectPanel objects={selectedObjects.map((id) => objects[id])} />
}

function SingleObjectPanel({
  object,
  onUpdate,
}: {
  object: SceneObject
  onUpdate: (id: string, updates: Partial<SceneObject>) => void
}) {
  const isHtmlWidget = object.type === "htmlWidget"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {object.type}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onUpdate(object.id, { visible: !object.visible })}>
              {object.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onUpdate(object.id, { locked: !object.locked })}>
              {object.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
          </div>
        </CardTitle>
        {OBJECT_DESCRIPTIONS[object.type] && (
          <p className="text-xs text-muted-foreground mt-1">{OBJECT_DESCRIPTIONS[object.type]}</p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={isHtmlWidget ? "widget" : "transform"} className="w-full">
          <TabsList className={`grid w-full ${isHtmlWidget ? "grid-cols-5" : "grid-cols-4"}`}>
            <TabsTrigger value="transform">转换</TabsTrigger>
            {!isHtmlWidget && <TabsTrigger value="material">材质</TabsTrigger>}
            {isHtmlWidget && <TabsTrigger value="widget">Widget</TabsTrigger>}
            <TabsTrigger value="animation">动画</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>

          <TabsContent value="transform" className="space-y-4">
            <div>
              <Label className="py-2">名称</Label>
              <Input value={object.name} onChange={(e) => onUpdate(object.id, { name: e.target.value })} />
            </div>

            <TransformControls object={object} onChange={(transform) => onUpdate(object.id, { transform })} />
          </TabsContent>

          {!isHtmlWidget && (
            <TabsContent value="material" className="space-y-4">
              <MaterialControls material={object.material} onChange={(material) => onUpdate(object.id, { material })} />
            </TabsContent>
          )}

          {isHtmlWidget && (
            <TabsContent value="widget" className="space-y-4">
              <WidgetPanel object={object} onUpdate={onUpdate} />
            </TabsContent>
          )}

          <TabsContent value="animation" className="space-y-4">
            <AnimationPanel object={object} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>可见性</Label>
              <Switch checked={object.visible} onCheckedChange={(visible) => onUpdate(object.id, { visible })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>锁定</Label>
              <Switch checked={object.locked} onCheckedChange={(locked) => onUpdate(object.id, { locked })} />
            </div>

            {/* Object Info */}
            <div className="pt-4 border-t space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">模型属性</Label>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <Badge variant="outline" className="text-xs">
                    {object.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>ID:</span>
                  <code className="text-xs bg-muted px-1 rounded">{object.id.slice(-8)}</code>
                </div>
                <div className="flex justify-between">
                  <span>Animations:</span>
                  <Badge variant="outline" className="text-xs">
                    {object.animations?.length || 0}
                  </Badge>
                </div>
                {isHtmlWidget && (
                  <div className="flex justify-between">
                    <span>Widget:</span>
                    <Badge variant="outline" className="text-xs">
                      {object.htmlWidget ? "Configured" : "None"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function MultiObjectPanel({ objects }: { objects: SceneObject[] }) {
  const { executeCommand } = useEditorStore()

  const handleDelete = () => {
    const command = new DeleteObjectCommand(objects.map((obj) => obj.id))
    executeCommand(command)
  }

  // Group objects by type for better overview
  const objectsByType = objects.reduce(
    (acc, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Multiple Objects
            <Badge variant="secondary">{objects.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type Summary */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Selection Summary</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(objectsByType).map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-xs">
                {count}× {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Object List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {objects.map((obj) => (
            <div key={obj.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {obj.type}
                </Badge>
                <span className="text-sm truncate">{obj.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {!obj.visible && <EyeOff className="w-3 h-3 text-muted-foreground" />}
                {obj.locked && <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TransformControls({
  object,
  onChange,
}: {
  object: SceneObject
  onChange: (transform: SceneObject["transform"]) => void
}) {
  const [lockAspectRatio, setLockAspectRatio] = useState(true)
  const [showDimensions, setShowDimensions] = useState(true)

  const { transform } = object
  const dimensions = object.type !== "htmlWidget" ? getObjectDimensions(object.type, transform.scale) : null

  const updateVector = (key: keyof SceneObject["transform"], axis: "x" | "y" | "z", value: number) => {
    const newTransform = { ...transform }

    if (key === "scale" && lockAspectRatio) {
      // 保持宽高比缩放
      const ratio = value / transform[key][axis]
      newTransform[key] = {
        x: transform[key].x * ratio,
        y: transform[key].y * ratio,
        z: transform[key].z * ratio,
      }
    } else {
      newTransform[key] = { ...transform[key], [axis]: value }
    }

    onChange(newTransform)
  }

  const updateUniformScale = (value: number) => {
    onChange({
      ...transform,
      scale: { x: value, y: value, z: value },
    })
  }

  return (
    <div className="space-y-4">
      {/* 尺寸信息 */}
      {dimensions && (
        <>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">维度</Label>
            <Button variant="ghost" size="sm" onClick={() => setShowDimensions(!showDimensions)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          {showDimensions && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Width</div>
                <div className="text-sm font-mono">{dimensions.width.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Height</div>
                <div className="text-sm font-mono">{dimensions.height.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Depth</div>
                <div className="text-sm font-mono">{dimensions.depth.toFixed(2)}</div>
              </div>
            </div>
          )}

          <Separator />
        </>
      )}

      {/* Position */}
      <div>
        <Label className="text-sm font-medium">定位</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(["x", "y", "z"] as const).map((axis) => (
            <div key={axis}>
              <Label className="text-xs text-muted-foreground">{axis.toUpperCase()}</Label>
              <Input
                type="number"
                step="0.1"
                value={transform.position[axis]}
                onChange={(e) => updateVector("position", axis, Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation */}
      <div>
        <Label className="text-sm font-medium">旋转 (°)</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(["x", "y", "z"] as const).map((axis) => (
            <div key={axis}>
              <Label className="text-xs text-muted-foreground">{axis.toUpperCase()}</Label>
              <Input
                type="number"
                step="1"
                value={Math.round((transform.rotation[axis] * 180) / Math.PI)}
                onChange={(e) =>
                  updateVector("rotation", axis, ((Number.parseFloat(e.target.value) || 0) * Math.PI) / 180)
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">缩放</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            className="h-6 w-6 p-0"
          >
            {lockAspectRatio ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
          </Button>
        </div>

        {lockAspectRatio ? (
          <div>
            <Label className="text-xs text-muted-foreground">Uniform Scale</Label>
            <Input
              type="number"
              step="0.1"
              min="0.01"
              value={transform.scale.x}
              onChange={(e) => updateUniformScale(Math.max(0.01, Number.parseFloat(e.target.value) || 1))}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {(["x", "y", "z"] as const).map((axis) => (
              <div key={axis}>
                <Label className="text-xs text-muted-foreground">{axis.toUpperCase()}</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={transform.scale[axis]}
                  onChange={(e) => updateVector("scale", axis, Math.max(0.01, Number.parseFloat(e.target.value) || 1))}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MaterialControls({
  material,
  onChange,
}: {
  material: SceneObject["material"]
  onChange: (material: SceneObject["material"]) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="color"
            value={material.color}
            onChange={(e) => onChange({ ...material, color: e.target.value })}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={material.color}
            onChange={(e) => onChange({ ...material, color: e.target.value })}
            className="flex-1"
            placeholder="#4F46E5"
          />
        </div>
      </div>

      <div>
        <Label>Roughness: {material.roughness.toFixed(2)}</Label>
        <Slider
          value={[material.roughness]}
          onValueChange={([value]) => onChange({ ...material, roughness: value })}
          max={1}
          min={0}
          step={0.01}
          className="mt-2"
        />
      </div>

      <div>
        <Label>Metalness: {material.metalness.toFixed(2)}</Label>
        <Slider
          value={[material.metalness]}
          onValueChange={([value]) => onChange({ ...material, metalness: value })}
          max={1}
          min={0}
          step={0.01}
          className="mt-2"
        />
      </div>

      <div>
        <Label>Opacity: {material.opacity.toFixed(2)}</Label>
        <Slider
          value={[material.opacity]}
          onValueChange={([value]) => onChange({ ...material, opacity: value })}
          max={1}
          min={0}
          step={0.01}
          className="mt-2"
        />
      </div>
    </div>
  )
}
