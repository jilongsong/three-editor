import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type {
  EditorState,
  SceneObject,
  TransformMode,
  Command,
  SceneData,
  UploadedModel,
  Animation,
  DataSource,
} from "@/types"

interface EditorStore extends EditorState {
  // History
  history: Command[]
  historyIndex: number

  // Models
  uploadedModels: UploadedModel[]

  // Transform controls state
  isTransforming: boolean

  // Actions
  addObject: (object: SceneObject) => void
  removeObject: (id: string) => void
  updateObject: (id: string, updates: Partial<SceneObject>) => void
  selectObjects: (ids: string[]) => void
  setTransformMode: (mode: TransformMode) => void
  toggleGrid: () => void
  toggleStats: () => void
  setSnapToGrid: (snap: boolean) => void
  setIsTransforming: (transforming: boolean) => void

  // Animation controls
  playAnimation: () => void
  pauseAnimation: () => void
  stopAnimation: () => void
  setAnimationTime: (time: number) => void
  addAnimation: (objectId: string, animation: Animation) => void
  updateAnimation: (objectId: string, animationId: string, updates: Partial<Animation>) => void
  removeAnimation: (objectId: string, animationId: string) => void

  // Data source management
  addDataSource: (dataSource: DataSource) => void
  updateDataSource: (id: string, updates: Partial<DataSource>) => void
  removeDataSource: (id: string) => void

  // History actions
  executeCommand: (command: Command) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Bulk operations
  duplicateObjects: (ids: string[]) => void
  deleteObjects: (ids: string[]) => void

  // Import/Export
  exportScene: () => SceneData
  importScene: (data: SceneData) => void
  clearScene: () => void

  // Model management
  addUploadedModel: (model: UploadedModel) => void
  removeUploadedModel: (id: string) => void
  getUploadedModels: () => UploadedModel[]
}

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    objects: {},
    selectedObjects: [],
    transformMode: "translate",
    snapToGrid: false,
    gridSize: 1,
    showGrid: true,
    showStats: true,
    history: [],
    historyIndex: -1,
    uploadedModels: [],
    isTransforming: false,
    isAnimationPlaying: false,
    animationTime: 0,
    dataSources: {},

    // Object operations
    addObject: (object) => {
      set((state) => ({
        objects: { ...state.objects, [object.id]: object },
        selectedObjects: [object.id],
      }))
    },

    removeObject: (id) => {
      set((state) => {
        const { [id]: removed, ...objects } = state.objects
        return {
          objects,
          selectedObjects: state.selectedObjects.filter((sid) => sid !== id),
        }
      })
    },

    updateObject: (id, updates) => {
      set((state) => ({
        objects: {
          ...state.objects,
          [id]: { ...state.objects[id], ...updates },
        },
      }))
    },

    selectObjects: (ids) => {
      set({ selectedObjects: ids })
    },

    setTransformMode: (mode) => {
      set({ transformMode: mode })
    },

    toggleGrid: () => {
      set((state) => ({ showGrid: !state.showGrid }))
    },

    toggleStats: () => {
      set((state) => ({ showStats: !state.showStats }))
    },

    setSnapToGrid: (snap) => {
      set({ snapToGrid: snap })
    },

    setIsTransforming: (transforming) => {
      set({ isTransforming: transforming })
    },

    // Animation controls
    playAnimation: () => {
      set({ isAnimationPlaying: true })
    },

    pauseAnimation: () => {
      set({ isAnimationPlaying: false })
    },

    stopAnimation: () => {
      set({ isAnimationPlaying: false, animationTime: 0 })
    },

    setAnimationTime: (time) => {
      set({ animationTime: time })
    },

    addAnimation: (objectId, animation) => {
      set((state) => ({
        objects: {
          ...state.objects,
          [objectId]: {
            ...state.objects[objectId],
            animations: [...(state.objects[objectId].animations || []), animation],
          },
        },
      }))
    },

    updateAnimation: (objectId, animationId, updates) => {
      set((state) => ({
        objects: {
          ...state.objects,
          [objectId]: {
            ...state.objects[objectId],
            animations: state.objects[objectId].animations.map((anim) =>
              anim.id === animationId ? { ...anim, ...updates } : anim,
            ),
          },
        },
      }))
    },

    removeAnimation: (objectId, animationId) => {
      set((state) => ({
        objects: {
          ...state.objects,
          [objectId]: {
            ...state.objects[objectId],
            animations: state.objects[objectId].animations.filter((anim) => anim.id !== animationId),
          },
        },
      }))
    },

    // Data source management
    addDataSource: (dataSource) => {
      set((state) => ({
        dataSources: { ...state.dataSources, [dataSource.id]: dataSource },
      }))
    },

    updateDataSource: (id, updates) => {
      set((state) => ({
        dataSources: {
          ...state.dataSources,
          [id]: { ...state.dataSources[id], ...updates },
        },
      }))
    },

    removeDataSource: (id) => {
      set((state) => {
        const { [id]: removed, ...dataSources } = state.dataSources
        return { dataSources }
      })
    },

    // History management
    executeCommand: (command) => {
      const state = get()
      command.execute()

      // Clear future history if we're not at the end
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(command)

      // Limit history size
      if (newHistory.length > 100) {
        newHistory.shift()
      }

      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      })
    },

    undo: () => {
      const state = get()
      if (state.historyIndex >= 0) {
        const command = state.history[state.historyIndex]
        command.undo()
        set({ historyIndex: state.historyIndex - 1 })
      }
    },

    redo: () => {
      const state = get()
      if (state.historyIndex < state.history.length - 1) {
        const command = state.history[state.historyIndex + 1]
        command.execute()
        set({ historyIndex: state.historyIndex + 1 })
      }
    },

    canUndo: () => get().historyIndex >= 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // Bulk operations
    duplicateObjects: (ids) => {
      const state = get()
      const newObjects: Record<string, SceneObject> = {}
      const newIds: string[] = []

      ids.forEach((id) => {
        const original = state.objects[id]
        if (original) {
          const newId = `${id}_copy_${Date.now()}`
          newObjects[newId] = {
            ...original,
            id: newId,
            name: `${original.name} Copy`,
            transform: {
              ...original.transform,
              position: {
                x: original.transform.position.x + 1,
                y: original.transform.position.y,
                z: original.transform.position.z + 1,
              },
            },
          }
          newIds.push(newId)
        }
      })

      set((state) => ({
        objects: { ...state.objects, ...newObjects },
        selectedObjects: newIds,
      }))
    },

    deleteObjects: (ids) => {
      set((state) => {
        const objects = { ...state.objects }
        ids.forEach((id) => delete objects[id])
        return {
          objects,
          selectedObjects: state.selectedObjects.filter((id) => !ids.includes(id)),
        }
      })
    },

    // Import/Export
    exportScene: () => {
      const state = get()
      return {
        version: "1.0.0",
        objects: state.objects,
        dataSources: state.dataSources,
        settings: {
          gridSize: state.gridSize,
          showGrid: state.showGrid,
        },
        metadata: {
          name: "Untitled Scene",
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        },
      }
    },

    importScene: (data) => {
      set({
        objects: data.objects,
        dataSources: data.dataSources || {},
        gridSize: data.settings?.gridSize || 1,
        showGrid: data.settings?.showGrid ?? true,
        selectedObjects: [],
        history: [],
        historyIndex: -1,
      })
    },

    clearScene: () => {
      set({
        objects: {},
        selectedObjects: [],
        history: [],
        historyIndex: -1,
        dataSources: {},
      })
    },

    // Model management
    addUploadedModel: (model) => {
      set((state) => ({
        uploadedModels: [...state.uploadedModels, model],
      }))
    },

    removeUploadedModel: (id) => {
      set((state) => ({
        uploadedModels: state.uploadedModels.filter((model) => model.id !== id),
      }))
    },

    getUploadedModels: () => get().uploadedModels,
  })),
)
