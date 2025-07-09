import type { Command, SceneObject } from "@/types"
import { useEditorStore } from "@/stores/editor-store"

export class AddObjectCommand implements Command {
  id = `add_${Date.now()}`
  name = "Add Object"

  constructor(private object: SceneObject) {}

  execute() {
    useEditorStore.getState().addObject(this.object)
  }

  undo() {
    useEditorStore.getState().removeObject(this.object.id)
  }
}

export class DeleteObjectCommand implements Command {
  id = `delete_${Date.now()}`
  name = "Delete Object"
  private deletedObjects: SceneObject[] = []

  constructor(private objectIds: string[]) {}

  execute() {
    const store = useEditorStore.getState()
    this.deletedObjects = this.objectIds.map((id) => store.objects[id]).filter(Boolean)
    store.deleteObjects(this.objectIds)
  }

  undo() {
    const store = useEditorStore.getState()
    this.deletedObjects.forEach((obj) => store.addObject(obj))
  }
}

export class TransformObjectCommand implements Command {
  id = `transform_${Date.now()}`
  name = "Transform Object"

  constructor(
    private objectId: string,
    private oldTransform: SceneObject["transform"],
    private newTransform: SceneObject["transform"],
  ) {}

  execute() {
    useEditorStore.getState().updateObject(this.objectId, { transform: this.newTransform })
  }

  undo() {
    useEditorStore.getState().updateObject(this.objectId, { transform: this.oldTransform })
  }
}
