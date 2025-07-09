"use client"

import { useEffect } from "react"
import { useEditorStore } from "@/stores/editor-store"
import { DeleteObjectCommand } from "@/commands/object-commands"

export function useKeyboard() {
  const store = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for our shortcuts
      const isCtrlOrCmd = event.ctrlKey || event.metaKey

      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case "z":
            event.preventDefault()
            if (event.shiftKey) {
              store.redo()
            } else {
              store.undo()
            }
            break
          case "y":
            event.preventDefault()
            store.redo()
            break
          case "d":
            event.preventDefault()
            if (store.selectedObjects.length > 0) {
              store.duplicateObjects(store.selectedObjects)
            }
            break
          case "a":
            event.preventDefault()
            store.selectObjects(Object.keys(store.objects))
            break
        }
      } else {
        switch (event.key.toLowerCase()) {
          case "delete":
          case "backspace":
            if (store.selectedObjects.length > 0) {
              const command = new DeleteObjectCommand(store.selectedObjects)
              store.executeCommand(command)
            }
            break
          case "g":
            store.setTransformMode("translate")
            break
          case "r":
            store.setTransformMode("rotate")
            break
          case "s":
            store.setTransformMode("scale")
            break
          case "escape":
            store.selectObjects([])
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [store])
}
