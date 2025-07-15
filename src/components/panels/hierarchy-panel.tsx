"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Lock, Unlock, Search } from "lucide-react"
import { useEditorStore } from "@/stores/editor-store"

export function HierarchyPanel() {
  const { objects, selectedObjects, selectObjects, updateObject } = useEditorStore()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredObjects = Object.values(objects).filter((obj) =>
    obj.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleObjectClick = (id: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      const newSelection = selectedObjects.includes(id)
        ? selectedObjects.filter((sid) => sid !== id)
        : [...selectedObjects, id]
      selectObjects(newSelection)
    } else if (event.shiftKey && selectedObjects.length > 0) {
      // Range select
      const objectIds = Object.keys(objects)
      const lastSelected = selectedObjects[selectedObjects.length - 1]
      const lastIndex = objectIds.indexOf(lastSelected)
      const currentIndex = objectIds.indexOf(id)

      const start = Math.min(lastIndex, currentIndex)
      const end = Math.max(lastIndex, currentIndex)
      const rangeIds = objectIds.slice(start, end + 1)

      selectObjects([...new Set([...selectedObjects, ...rangeIds])])
    } else {
      // Single select
      selectObjects([id])
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search objects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-full px-2">
        <div className="flex-1 overflow-y-auto custom-scrollbar-hide">
          {filteredObjects.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchTerm ? "No objects found" : "No objects in scene"}
            </div>
          ) : (
            filteredObjects.map((obj) => (
              <div
                key={obj.id}
                className={`flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer border-l-2 ${
                  selectedObjects.includes(obj.id) ? "bg-primary/10 border-l-primary" : "border-l-transparent"
                }`}
                onClick={(e) => handleObjectClick(obj.id, e)}
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium truncate">{obj.name}</span>
                  <span className="text-xs text-muted-foreground">{obj.type}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      updateObject(obj.id, { visible: !obj.visible })
                    }}
                  >
                    {obj.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      updateObject(obj.id, { locked: !obj.locked })
                    }}
                  >
                    {obj.locked ? <Lock className="h-3 w-3 text-muted-foreground" /> : <Unlock className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
