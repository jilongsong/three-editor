export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Transform {
  position: Vector3
  rotation: Vector3
  scale: Vector3
}

export interface Material {
  color: string
  roughness: number
  metalness: number
  opacity: number
}

export interface AnimationKeyframe {
  time: number // 时间点 (0-1)
  transform?: Partial<Transform>
  material?: Partial<Material>
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut" | "bounce"
}

export interface Animation {
  id: string
  name: string
  type: "transform" | "material" | "custom"
  duration: number // 持续时间（秒）
  loop: boolean
  autoPlay: boolean
  keyframes: AnimationKeyframe[]
  enabled: boolean
}

// HTML Widget 相关类型
export interface WidgetData {
  [key: string]: any
}

export interface DataSource {
  id: string
  name: string
  type: "static" | "api" | "websocket" | "interval"
  url?: string
  method?: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  body?: string
  interval?: number // 刷新间隔（毫秒）
  data: WidgetData
  lastUpdated?: string
}

export interface WidgetStyle {
  width: number
  height: number
  backgroundColor: string
  borderRadius: number
  padding: number
  fontSize: number
  fontFamily: string
  color: string
  border: string
  boxShadow: string
  opacity: number
}

export interface HtmlWidget {
  id: string
  name: string
  template: string // HTML模板
  style: WidgetStyle
  dataSourceId?: string
  autoRefresh: boolean
  refreshInterval: number
  position3D: Vector3 // 3D空间中的位置
  lookAtCamera: boolean // 是否始终面向相机
  scale3D: number // 3D空间中的缩放
}

export interface SceneObject {
  id: string
  name: string
  type: ObjectType
  transform: Transform
  material: Material
  visible: boolean
  locked: boolean
  modelUrl?: string
  animations: Animation[]
  // HTML Widget 属性
  htmlWidget?: HtmlWidget
  // 尺寸信息
  dimensions?: {
    width: number
    height: number
    depth: number
  }
}

export type ObjectType =
  | "box"
  | "sphere"
  | "cylinder"
  | "cone"
  | "plane"
  | "torus"
  | "dodecahedron"
  | "icosahedron"
  | "octahedron"
  | "tetrahedron"
  | "ring"
  | "capsule"
  | "tube"
  | "pyramid"
  | "prism"
  | "model"
  | "htmlWidget" // 新增HTML Widget类型

export type TransformMode = "translate" | "rotate" | "scale"

export interface Command {
  id: string
  name: string
  execute(): void
  undo(): void
}

export interface EditorState {
  objects: Record<string, SceneObject>
  selectedObjects: string[]
  transformMode: TransformMode
  snapToGrid: boolean
  gridSize: number
  showGrid: boolean
  showStats: boolean
  // 动画控制
  isAnimationPlaying: boolean
  animationTime: number
  // 数据源管理
  dataSources: Record<string, DataSource>
}

export interface SceneData {
  version: string
  objects: Record<string, SceneObject>
  dataSources: Record<string, DataSource>
  settings: {
    gridSize: number
    showGrid: boolean
  }
  metadata: {
    name: string
    createdAt: string
    modifiedAt: string
  }
}

export interface UploadedModel {
  id: string
  name: string
  url: string
  thumbnail?: string
  uploadedAt: string
}

// 预设动画模板
export interface AnimationPreset {
  id: string
  name: string
  description: string
  icon: string
  template: Omit<Animation, "id" | "name">
}

// Widget 模板
export interface WidgetTemplate {
  id: string
  name: string
  description: string
  icon: string
  template: string
  style: WidgetStyle
  sampleData: WidgetData
}
