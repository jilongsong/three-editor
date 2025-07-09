import type { Animation, Transform, Material, AnimationPreset } from "@/types"

// 缓动函数
export const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  bounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  },
}

// 插值函数
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

export function lerpVector3(start: any, end: any, t: number) {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
    z: lerp(start.z, end.z, t),
  }
}

// 计算动画在指定时间的值
export function calculateAnimationValue(
  animation: Animation,
  currentTime: number,
  baseTransform: Transform,
  baseMaterial: Material,
): { transform: Transform; material: Material } {
  if (!animation.enabled || animation.keyframes.length === 0) {
    return { transform: baseTransform, material: baseMaterial }
  }

  // 计算循环时间
  const normalizedTime = animation.loop
    ? (currentTime % animation.duration) / animation.duration
    : Math.min(currentTime / animation.duration, 1)

  // 找到当前时间对应的关键帧
  const sortedKeyframes = [...animation.keyframes].sort((a, b) => a.time - b.time)

  let prevKeyframe = sortedKeyframes[0]
  let nextKeyframe = sortedKeyframes[sortedKeyframes.length - 1]

  for (let i = 0; i < sortedKeyframes.length - 1; i++) {
    if (normalizedTime >= sortedKeyframes[i].time && normalizedTime <= sortedKeyframes[i + 1].time) {
      prevKeyframe = sortedKeyframes[i]
      nextKeyframe = sortedKeyframes[i + 1]
      break
    }
  }

  // 计算插值参数
  const timeDiff = nextKeyframe.time - prevKeyframe.time
  const t = timeDiff === 0 ? 0 : (normalizedTime - prevKeyframe.time) / timeDiff

  // 应用缓动
  const easing = nextKeyframe.easing || "linear"
  const easedT = easingFunctions[easing](t)

  // 插值变换
  let resultTransform = { ...baseTransform }
  let resultMaterial = { ...baseMaterial }

  if (prevKeyframe.transform || nextKeyframe.transform) {
    const startTransform = {
      position: prevKeyframe.transform?.position || baseTransform.position,
      rotation: prevKeyframe.transform?.rotation || baseTransform.rotation,
      scale: prevKeyframe.transform?.scale || baseTransform.scale,
    }

    const endTransform = {
      position: nextKeyframe.transform?.position || baseTransform.position,
      rotation: nextKeyframe.transform?.rotation || baseTransform.rotation,
      scale: nextKeyframe.transform?.scale || baseTransform.scale,
    }

    resultTransform = {
      position: lerpVector3(startTransform.position, endTransform.position, easedT),
      rotation: lerpVector3(startTransform.rotation, endTransform.rotation, easedT),
      scale: lerpVector3(startTransform.scale, endTransform.scale, easedT),
    }
  }

  if (prevKeyframe.material || nextKeyframe.material) {
    const startMaterial = { ...baseMaterial, ...prevKeyframe.material }
    const endMaterial = { ...baseMaterial, ...nextKeyframe.material }

    resultMaterial = {
      color: endMaterial.color || baseMaterial.color, // 颜色不插值，直接切换
      roughness: lerp(startMaterial.roughness, endMaterial.roughness, easedT),
      metalness: lerp(startMaterial.metalness, endMaterial.metalness, easedT),
      opacity: lerp(startMaterial.opacity, endMaterial.opacity, easedT),
    }
  }

  return { transform: resultTransform, material: resultMaterial }
}

// 预设动画模板
export const animationPresets: AnimationPreset[] = [
  {
    id: "rotate-y",
    name: "旋转",
    description: "绕Y轴持续旋转",
    icon: "🔄",
    template: {
      type: "transform",
      duration: 4,
      loop: true,
      autoPlay: true,
      enabled: true,
      keyframes: [
        {
          time: 0,
          transform: { rotation: { x: 0, y: 0, z: 0 } },
          easing: "linear",
        },
        {
          time: 1,
          transform: { rotation: { x: 0, y: Math.PI * 2, z: 0 } },
          easing: "linear",
        },
      ],
    },
  },
  {
    id: "bounce",
    name: "弹跳",
    description: "上下弹跳运动",
    icon: "⬆️",
    template: {
      type: "transform",
      duration: 2,
      loop: true,
      autoPlay: true,
      enabled: true,
      keyframes: [
        {
          time: 0,
          transform: { position: { x: 0, y: 0, z: 0 } },
          easing: "easeOut",
        },
        {
          time: 0.5,
          transform: { position: { x: 0, y: 2, z: 0 } },
          easing: "easeIn",
        },
        {
          time: 1,
          transform: { position: { x: 0, y: 0, z: 0 } },
          easing: "bounce",
        },
      ],
    },
  },
  {
    id: "pulse",
    name: "脉冲",
    description: "缩放脉冲效果",
    icon: "💓",
    template: {
      type: "transform",
      duration: 1.5,
      loop: true,
      autoPlay: true,
      enabled: true,
      keyframes: [
        {
          time: 0,
          transform: { scale: { x: 1, y: 1, z: 1 } },
          easing: "easeInOut",
        },
        {
          time: 0.5,
          transform: { scale: { x: 1.3, y: 1.3, z: 1.3 } },
          easing: "easeInOut",
        },
        {
          time: 1,
          transform: { scale: { x: 1, y: 1, z: 1 } },
          easing: "easeInOut",
        },
      ],
    },
  },
  {
    id: "fade",
    name: "淡入淡出",
    description: "透明度变化效果",
    icon: "👻",
    template: {
      type: "material",
      duration: 3,
      loop: true,
      autoPlay: true,
      enabled: true,
      keyframes: [
        {
          time: 0,
          material: { opacity: 1 },
          easing: "easeInOut",
        },
        {
          time: 0.5,
          material: { opacity: 0.2 },
          easing: "easeInOut",
        },
        {
          time: 1,
          material: { opacity: 1 },
          easing: "easeInOut",
        },
      ],
    },
  },
  {
    id: "orbit",
    name: "轨道运动",
    description: "围绕中心点旋转",
    icon: "🌍",
    template: {
      type: "transform",
      duration: 6,
      loop: true,
      autoPlay: true,
      enabled: true,
      keyframes: [
        {
          time: 0,
          transform: { position: { x: 3, y: 0, z: 0 } },
          easing: "linear",
        },
        {
          time: 0.25,
          transform: { position: { x: 0, y: 0, z: 3 } },
          easing: "linear",
        },
        {
          time: 0.5,
          transform: { position: { x: -3, y: 0, z: 0 } },
          easing: "linear",
        },
        {
          time: 0.75,
          transform: { position: { x: 0, y: 0, z: -3 } },
          easing: "linear",
        },
        {
          time: 1,
          transform: { position: { x: 3, y: 0, z: 0 } },
          easing: "linear",
        },
      ],
    },
  },
]

// 获取对象的实际尺寸
export function getObjectDimensions(type: string, scale: any) {
  const baseDimensions = {
    box: { width: 1, height: 1, depth: 1 },
    sphere: { width: 1, height: 1, depth: 1 },
    cylinder: { width: 1, height: 1, depth: 1 },
    cone: { width: 1, height: 1, depth: 1 },
    plane: { width: 1, height: 0, depth: 1 },
    torus: { width: 1, height: 0.4, depth: 1 },
    dodecahedron: { width: 1, height: 1, depth: 1 },
    icosahedron: { width: 1, height: 1, depth: 1 },
    octahedron: { width: 1, height: 1, depth: 1 },
    tetrahedron: { width: 1, height: 1, depth: 1 },
    ring: { width: 1, height: 0, depth: 1 },
    capsule: { width: 0.6, height: 1, depth: 0.6 },
    tube: { width: 1, height: 0.2, depth: 1 },
    pyramid: { width: 1, height: 1, depth: 1 },
    prism: { width: 1, height: 1, depth: 1 },
    model: { width: 2, height: 2, depth: 2 },
  }

  const base = baseDimensions[type as keyof typeof baseDimensions] || baseDimensions.box

  return {
    width: base.width * scale.x,
    height: base.height * scale.y,
    depth: base.depth * scale.z,
  }
}
