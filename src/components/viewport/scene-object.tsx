"use client"

import { useRef, useCallback, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { TransformControls } from "@react-three/drei"
// @ts-expect-error: no type declaration for three
import type * as THREE from "three"
import type { SceneObject } from "@/types"
import { useEditorStore } from "@/stores/editor-store"
import { TransformObjectCommand } from "@/commands/object-commands"

interface SceneObjectProps {
  object: SceneObject
  isSelected: boolean
  onSelect: (id: string, event: THREE.Event) => void
}

export function SceneObjectComponent({ object, isSelected, onSelect }: SceneObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { transformMode, executeCommand, snapToGrid, gridSize } = useEditorStore()
  const previousTransform = useRef(object.transform)

  const handleTransformStart = useCallback(() => {
    previousTransform.current = { ...object.transform }
  }, [object.transform])

  const handleTransformEnd = useCallback(() => {
    if (meshRef.current) {
      const newTransform = {
        position: {
          x: meshRef.current.position.x,
          y: meshRef.current.position.y,
          z: meshRef.current.position.z,
        },
        rotation: {
          x: meshRef.current.rotation.x,
          y: meshRef.current.rotation.y,
          z: meshRef.current.rotation.z,
        },
        scale: {
          x: meshRef.current.scale.x,
          y: meshRef.current.scale.y,
          z: meshRef.current.scale.z,
        },
      }

      // Apply grid snapping if enabled
      if (snapToGrid && transformMode === "translate") {
        newTransform.position.x = Math.round(newTransform.position.x / gridSize) * gridSize
        newTransform.position.z = Math.round(newTransform.position.z / gridSize) * gridSize
      }

      const command = new TransformObjectCommand(object.id, previousTransform.current, newTransform)
      executeCommand(command)
    }
  }, [object.id, executeCommand, snapToGrid, gridSize, transformMode])

  const geometry = useMemo(() => {
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
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }, [object.type])

  const material = useMemo(
    () => (
      <meshStandardMaterial
        color={object.material.color}
        roughness={object.material.roughness}
        metalness={object.material.metalness}
        transparent={object.material.opacity < 1}
        opacity={object.material.opacity}
      />
    ),
    [object.material],
  )

  // Update mesh transform when object changes
  useFrame(() => {
    if (meshRef.current && !isSelected) {
      meshRef.current.position.set(
        object.transform.position.x,
        object.transform.position.y,
        object.transform.position.z,
      )
      meshRef.current.rotation.set(
        object.transform.rotation.x,
        object.transform.rotation.y,
        object.transform.rotation.z,
      )
      meshRef.current.scale.set(object.transform.scale.x, object.transform.scale.y, object.transform.scale.z)
    }
  })

  if (!object.visible) {
    return null
  }

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[object.transform.position.x, object.transform.position.y, object.transform.position.z]}
        rotation={[object.transform.rotation.x, object.transform.rotation.y, object.transform.rotation.z]}
        scale={[object.transform.scale.x, object.transform.scale.y, object.transform.scale.z]}
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

      {isSelected && !object.locked && (
        <TransformControls
          object={meshRef.current as any}
          mode={transformMode}
          onMouseDown={handleTransformStart}
          onMouseUp={handleTransformEnd}
          size={0.8}
          showX
          showY
          showZ
        />
      )}
    </group>
  )
}
