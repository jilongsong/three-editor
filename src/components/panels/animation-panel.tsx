"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Play, Pause, Square, Plus, Trash2, Copy, Settings } from "lucide-react"
import { useEditorStore } from "@/stores/editor-store"
import { animationPresets } from "@/utils/animation-utils"
import type { SceneObject, Animation, AnimationPreset } from "@/types"

interface AnimationPanelProps {
  object: SceneObject
  onUpdate: (id: string, updates: Partial<SceneObject>) => void
}

export function AnimationPanel({ object, onUpdate }: AnimationPanelProps) {
  const { isAnimationPlaying, playAnimation, pauseAnimation, stopAnimation } = useEditorStore()
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false)

  const animations = object.animations || []

  const handleAddPresetAnimation = (preset: AnimationPreset) => {
    const newAnimation: Animation = {
      ...preset.template,
      id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: preset.name,
    }

    onUpdate(object.id, {
      animations: [...animations, newAnimation],
    })
    setIsPresetDialogOpen(false)
  }

  const handleUpdateAnimation = (animationId: string, updates: Partial<Animation>) => {
    const updatedAnimations = animations.map((anim) => (anim.id === animationId ? { ...anim, ...updates } : anim))
    onUpdate(object.id, { animations: updatedAnimations })
  }

  const handleRemoveAnimation = (animationId: string) => {
    const updatedAnimations = animations.filter((anim) => anim.id !== animationId)
    onUpdate(object.id, { animations: updatedAnimations })
    if (selectedAnimation === animationId) {
      setSelectedAnimation(null)
    }
  }

  const handleDuplicateAnimation = (animation: Animation) => {
    const newAnimation: Animation = {
      ...animation,
      id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${animation.name} Copy`,
    }
    onUpdate(object.id, {
      animations: [...animations, newAnimation],
    })
  }

  return (
    <div className="space-y-4">
      {/* Animation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            Animation Controls
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={isAnimationPlaying ? pauseAnimation : playAnimation}>
                {isAnimationPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={stopAnimation}>
                <Square className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {animations.length} animation{animations.length !== 1 ? "s" : ""}
            </span>
            <Badge variant={isAnimationPlaying ? "default" : "secondary"}>
              {isAnimationPlaying ? "Playing" : "Stopped"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Animation List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            Animations
            <Dialog open={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Animation</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-2 gap-3 p-1">
                    {animationPresets.map((preset) => (
                      <Button
                        key={preset.id}
                        variant="outline"
                        className="h-20 flex-col gap-2 text-left bg-transparent"
                        onClick={() => handleAddPresetAnimation(preset)}
                      >
                        <div className="text-lg">{preset.icon}</div>
                        <div>
                          <div className="font-medium text-sm">{preset.name}</div>
                          <div className="text-xs text-muted-foreground">{preset.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {animations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground text-sm mb-2">No animations</div>
              <Button variant="outline" size="sm" onClick={() => setIsPresetDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Animation
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {animations.map((animation) => (
                  <AnimationItem
                    key={animation.id}
                    animation={animation}
                    isSelected={selectedAnimation === animation.id}
                    onSelect={() => setSelectedAnimation(animation.id)}
                    onUpdate={(updates) => handleUpdateAnimation(animation.id, updates)}
                    onRemove={() => handleRemoveAnimation(animation.id)}
                    onDuplicate={() => handleDuplicateAnimation(animation)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Animation Details */}
      {selectedAnimation && (
        <AnimationDetails
          animation={animations.find((a) => a.id === selectedAnimation)!}
          onUpdate={(updates) => handleUpdateAnimation(selectedAnimation, updates)}
        />
      )}
    </div>
  )
}

function AnimationItem({
  animation,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onDuplicate,
}: {
  animation: Animation
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<Animation>) => void
  onRemove: () => void
  onDuplicate: () => void
}) {
  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-medium text-sm">{animation.name}</div>
          <Badge variant="outline" className="text-xs">
            {animation.type}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Switch
            checked={animation.enabled}
            onCheckedChange={(enabled) => onUpdate({ enabled })}
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {animation.duration}s • {animation.keyframes.length} keyframes
        {animation.loop && " • Loop"}
        {animation.autoPlay && " • Auto-play"}
      </div>
    </div>
  )
}

function AnimationDetails({
  animation,
  onUpdate,
}: {
  animation: Animation
  onUpdate: (updates: Partial<Animation>) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings className="w-4 h-4" />
          Animation Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={animation.name} onChange={(e) => onUpdate({ name: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duration (seconds)</Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={animation.duration}
              onChange={(e) => onUpdate({ duration: Math.max(0.1, Number.parseFloat(e.target.value) || 1) })}
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={animation.type} onValueChange={(type: any) => onUpdate({ type })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transform">Transform</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Loop Animation</Label>
            <Switch checked={animation.loop} onCheckedChange={(loop) => onUpdate({ loop })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto Play</Label>
            <Switch checked={animation.autoPlay} onCheckedChange={(autoPlay) => onUpdate({ autoPlay })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch checked={animation.enabled} onCheckedChange={(enabled) => onUpdate({ enabled })} />
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-2 block">Keyframes ({animation.keyframes.length})</Label>
          <div className="text-xs text-muted-foreground">Advanced keyframe editing coming soon...</div>
        </div>
      </CardContent>
    </Card>
  )
}
