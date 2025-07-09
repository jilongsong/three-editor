"use client"

import React from "react"
// @ts-expect-error: no type declaration for three
import * as THREE from "three"

import { useRef, useCallback, useMemo, useEffect, Suspense } from "react"
import { useFrame } from "@react-three/fiber"
import { TransformControls, useGLTF, Html } from "@react-three/drei"
import type { SceneObject } from "@/types"
import { useEditorStore } from "@/stores/editor-store"
import { TransformObjectCommand } from "@/commands/object-commands"
import { calculateAnimationValue } from "@/utils/animation-utils"
import { HtmlWidgetRenderer } from "./html-widget-renderer"

interface SceneObjectProps {
  object: SceneObject
  isSelected: boolean
  onSelect: (id: string, event: THREE.Event) => void
}

export function SceneObjectComponent({ object, isSelected, onSelect }: SceneObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const transformControlsRef = useRef<any>(null)
  const {
    transformMode,
    executeCommand,
    snapToGrid,
    gridSize,
    setIsTransforming,
    isAnimationPlaying,
    animationTime,
    isTransforming,
  } = useEditorStore()
  const previousTransform = useRef(object.transform)

  // Calculate animated values - 使用稳定的依赖
  const animatedValues = useMemo(() => {
    if (!isAnimationPlaying || !object.animations?.length) {
      return { transform: object.transform, material: object.material }
    }

    let resultTransform = { ...object.transform }
    let resultMaterial = { ...object.material }

    object.animations.forEach((animation) => {
      if (animation.enabled && animation.autoPlay) {
        const animatedValue = calculateAnimationValue(animation, animationTime, object.transform, object.material)
        resultTransform = animatedValue.transform
        resultMaterial = animatedValue.material
      }
    })

    return { transform: resultTransform, material: resultMaterial }
  }, [object.transform, object.material, object.animations, isAnimationPlaying, animationTime])

  const handleTransformStart = useCallback(() => {
    setIsTransforming(true)
    const ref = meshRef.current || groupRef.current
    if (ref) {
      previousTransform.current = {
        position: { x: ref.position.x, y: ref.position.y, z: ref.position.z },
        rotation: { x: ref.rotation.x, y: ref.rotation.y, z: ref.rotation.z },
        scale: { x: ref.scale.x, y: ref.scale.y, z: ref.scale.z },
      }
    }
  }, [setIsTransforming])

  const handleTransformEnd = useCallback(() => {
    setIsTransforming(false)
    const ref = meshRef.current || groupRef.current
    if (ref) {
      const newTransform = {
        position: { x: ref.position.x, y: ref.position.y, z: ref.position.z },
        rotation: { x: ref.rotation.x, y: ref.rotation.y, z: ref.rotation.z },
        scale: { x: ref.scale.x, y: ref.scale.y, z: ref.scale.z },
      }

      if (snapToGrid && transformMode === "translate") {
        newTransform.position.x = Math.round(newTransform.position.x / gridSize) * gridSize
        newTransform.position.z = Math.round(newTransform.position.z / gridSize) * gridSize
        ref.position.x = newTransform.position.x
        ref.position.z = newTransform.position.z
      }

      const command = new TransformObjectCommand(object.id, previousTransform.current, newTransform)
      executeCommand(command)
    }
  }, [object.id, executeCommand, snapToGrid, gridSize, transformMode, setIsTransforming])

  const geometry = useMemo(() => {
    if (object.type === "model" || object.type === "htmlWidget") return null

    switch (object.type) {
      case "box":
        return <boxGeometry args={[1, 1, 1]} />
      case "sphere":
        return <sphereGeometry args={[0.5, 32, 32]} />
      case "cylinder":
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
      case "cone":
        return <coneGeometry args={[0.5, 1, 32]} />
      case "plane":
        return <planeGeometry args={[1, 1]} />
      case "torus":
        return <torusGeometry args={[0.5, 0.2, 16, 100]} />
      case "dodecahedron":
        return <dodecahedronGeometry args={[0.5]} />
      case "icosahedron":
        return <icosahedronGeometry args={[0.5]} />
      case "octahedron":
        return <octahedronGeometry args={[0.5]} />
      case "tetrahedron":
        return <tetrahedronGeometry args={[0.5]} />
      case "ring":
        return <ringGeometry args={[0.3, 0.5, 16]} />
      case "capsule":
        return <capsuleGeometry args={[0.3, 1, 4, 8]} />
      case "tube":
        return (
          <tubeGeometry
            args={[
              new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.5, 0, 0),
                new THREE.Vector3(-0.25, 0.25, 0),
                new THREE.Vector3(0.25, -0.25, 0),
                new THREE.Vector3(0.5, 0, 0),
              ]),
              20,
              0.1,
              8,
              false,
            ]}
          />
        )
      case "pyramid":
        return <coneGeometry args={[0.5, 1, 4]} />
      case "prism":
        return <cylinderGeometry args={[0.5, 0.5, 1, 6]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }, [object.type])

  const material = useMemo(
    () => (
      <meshStandardMaterial
        color={animatedValues.material.color}
        roughness={animatedValues.material.roughness}
        metalness={animatedValues.material.metalness}
        transparent={animatedValues.material.opacity < 1}
        opacity={animatedValues.material.opacity}
        side={object.type === "ring" ? THREE.DoubleSide : THREE.FrontSide}
      />
    ),
    [animatedValues.material, object.type],
  )

  // Update transform - 简化条件判断
  useFrame(() => {
    const ref = meshRef.current || groupRef.current
    if (ref && !isSelected && !isTransforming) {
      const transform = animatedValues.transform
      ref.position.set(transform.position.x, transform.position.y, transform.position.z)
      ref.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z)
      ref.scale.set(transform.scale.x, transform.scale.y, transform.scale.z)
    }
  })

  // Clean up
  useEffect(() => {
    return () => {
      if (transformControlsRef.current) {
        transformControlsRef.current.dispose?.()
      }
    }
  }, [])

  if (!object.visible) {
    return null
  }

  // Render HTML Widget
  if (object.type === "htmlWidget" && object.htmlWidget) {
    return (
      <HtmlWidgetObject
        key={object.id} // 添加key确保组件正确重新渲染
        object={object}
        isSelected={isSelected}
        onSelect={onSelect}
        animatedValues={animatedValues}
        transformMode={transformMode}
        onTransformStart={handleTransformStart}
        onTransformEnd={handleTransformEnd}
      />
    )
  }

  // Render custom model
  if (object.type === "model" && object.modelUrl) {
    return (
      <group>
        <Suspense fallback={null}>
          <ModelMesh
            ref={groupRef}
            url={object.modelUrl}
            transform={animatedValues.transform}
            isSelected={isSelected}
            onSelect={onSelect}
            objectId={object.id}
          />
        </Suspense>

        {isSelected && !object.locked && groupRef.current && (
          <TransformControls
            ref={transformControlsRef}
            object={groupRef.current}
            mode={transformMode}
            onMouseDown={handleTransformStart}
            onMouseUp={handleTransformEnd}
            size={0.8}
            showX
            showY
            showZ
            space="world"
          />
        )}
      </group>
    )
  }

  // Render primitive geometry
  return (
    <group>
      <mesh
        ref={meshRef}
        position={[
          animatedValues.transform.position.x,
          animatedValues.transform.position.y,
          animatedValues.transform.position.z,
        ]}
        rotation={[
          animatedValues.transform.rotation.x,
          animatedValues.transform.rotation.y,
          animatedValues.transform.rotation.z,
        ]}
        scale={[animatedValues.transform.scale.x, animatedValues.transform.scale.y, animatedValues.transform.scale.z]}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(object.id, e)
        }}
        castShadow
        receiveShadow
      >
        {geometry}
        {material}
        {isSelected && <meshBasicMaterial color="#ff6b35" wireframe transparent opacity={0.3} />}
      </mesh>

      {isSelected && !object.locked && meshRef.current && (
        <TransformControls
          ref={transformControlsRef}
          object={meshRef.current}
          mode={transformMode}
          onMouseDown={handleTransformStart}
          onMouseUp={handleTransformEnd}
          size={0.8}
          showX
          showY
          showZ
          space="world"
        />
      )}
    </group>
  )
}

// 独立的HTML Widget组件 - 使用React.memo优化
const HtmlWidgetObject = React.memo(function HtmlWidgetObject({
  object,
  isSelected,
  onSelect,
  animatedValues,
  transformMode,
  onTransformStart,
  onTransformEnd,
}: {
  object: SceneObject
  isSelected: boolean
  onSelect: (id: string, event: THREE.Event) => void
  animatedValues: any
  transformMode: any
  onTransformStart: () => void
  onTransformEnd: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const transformControlsRef = useRef<any>(null)
  const { isTransforming } = useEditorStore()
  const lastUpdateRef = useRef({ isSelected: false, isTransforming: false })

  const widget = object.htmlWidget!

  // 计算HTML Widget的实际尺寸
  const widgetWidth = (widget.style.width / 200) * widget.scale3D
  const widgetHeight = (widget.style.height / 200) * widget.scale3D

  // 同步位置 - 优化更新条件
  useFrame(() => {
    if (groupRef.current) {
      const shouldUpdate = !isSelected && !isTransforming
      const lastUpdate = lastUpdateRef.current

      // 只在状态真正改变时更新
      if (shouldUpdate && (lastUpdate.isSelected !== isSelected || lastUpdate.isTransforming !== isTransforming)) {
        const transform = animatedValues.transform
        groupRef.current.position.set(transform.position.x, transform.position.y, transform.position.z)
        groupRef.current.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z)
        groupRef.current.scale.set(transform.scale.x, transform.scale.y, transform.scale.z)
      }

      lastUpdateRef.current = { isSelected, isTransforming }
    }
  })

  return (
    <group
      ref={groupRef}
      position={[
        animatedValues.transform.position.x,
        animatedValues.transform.position.y,
        animatedValues.transform.position.z,
      ]}
      rotation={[
        animatedValues.transform.rotation.x,
        animatedValues.transform.rotation.y,
        animatedValues.transform.rotation.z,
      ]}
      scale={[animatedValues.transform.scale.x, animatedValues.transform.scale.y, animatedValues.transform.scale.z]}
    >
      {/* 可点击的选择目标 */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(object.id, e)
        }}
        visible={isSelected}
      >
        <planeGeometry args={[widgetWidth, widgetHeight]} />
        <meshBasicMaterial color="#ff6b35" wireframe transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* 不可见的点击区域 */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(object.id, e)
        }}
        visible={false}
      >
        <planeGeometry args={[widgetWidth, widgetHeight]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* HTML 内容 */}
      <Html
        transform
        sprite={widget.lookAtCamera}
        occlude={false}
        pointerEvents="none"
        center
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={{
            transform: `scale(${widget.scale3D * 0.5})`,
            transformOrigin: "center center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <HtmlWidgetRenderer widget={widget} />
        </div>
      </Html>

      {/* Transform Controls */}
      {isSelected && !object.locked && groupRef.current && (
        <TransformControls
          ref={transformControlsRef}
          object={groupRef.current}
          mode={transformMode}
          onMouseDown={onTransformStart}
          onMouseUp={onTransformEnd}
          size={0.8}
          showX
          showY
          showZ
          space="world"
        />
      )}
    </group>
  )
})

// Separate component for handling GLTF models
const ModelMesh = React.forwardRef<
  THREE.Group,
  {
    url: string
    transform: SceneObject["transform"]
    isSelected: boolean
    onSelect: (id: string, event: THREE.Event) => void
    objectId: string
  }
>(({ url, transform, isSelected, onSelect, objectId }, ref) => {
  const { scene } = useGLTF(url)

  return (
    <group
      ref={ref}
      position={[transform.position.x, transform.position.y, transform.position.z]}
      rotation={[transform.rotation.x, transform.rotation.y, transform.rotation.z]}
      scale={[transform.scale.x, transform.scale.y, transform.scale.z]}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(objectId, e)
      }}
    >
      <primitive object={scene.clone()} />
      {isSelected && (
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshBasicMaterial color="#ff6b35" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  )
})

ModelMesh.displayName = "ModelMesh"
