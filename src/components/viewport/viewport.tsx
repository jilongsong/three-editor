"use client"

import { Suspense, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Stats, Environment, GizmoHelper, GizmoViewport } from "@react-three/drei"
import { useEditorStore } from "@/stores/editor-store"
import { SceneObjectComponent } from "./scene-object"

export function Viewport() {
  const { objects, selectedObjects, selectObjects, showGrid, showStats, gridSize } = useEditorStore()

  const handleObjectSelect = useCallback(
    (id: string, event: any) => {
      if (event.nativeEvent.ctrlKey || event.nativeEvent.metaKey) {
        // Multi-select
        const newSelection = selectedObjects.includes(id)
          ? selectedObjects.filter((sid) => sid !== id)
          : [...selectedObjects, id]
        selectObjects(newSelection)
      } else {
        // Single select
        selectObjects([id])
      }
    },
    [selectedObjects, selectObjects],
  )

  const handleCanvasClick = useCallback(
    (event: any) => {
      // Deselect all when clicking empty space
      if (event.target === event.currentTarget) {
        selectObjects([])
      }
    },
    [selectObjects],
  )

  return (
    <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-slate-100">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        shadows
        onClick={handleCanvasClick}
        onPointerMissed={() => selectObjects([])}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />

          {/* Grid */}
          {showGrid && (
            <Grid
              args={[20, 20]}
              position={[0, -0.01, 0]}
              cellSize={gridSize}
              cellThickness={0.5}
              cellColor="#6b7280"
              sectionSize={gridSize * 5}
              sectionThickness={1}
              sectionColor="#374151"
              fadeDistance={30}
              fadeStrength={1}
            />
          )}

          {/* Scene Objects */}
          {Object.values(objects).map((object) => (
            <SceneObjectComponent
              key={object.id}
              object={object}
              isSelected={selectedObjects.includes(object.id)}
              onSelect={handleObjectSelect}
            />
          ))}

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 0, 0]}
            maxPolarAngle={Math.PI / 2}
            minDistance={1}
            maxDistance={100}
          />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Gizmo */}
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport axisColors={["#ff6b35", "#4ade80", "#3b82f6"]} labelColor="black" />
          </GizmoHelper>

          {/* Stats */}
          {showStats && <Stats />}
        </Suspense>
      </Canvas>

      {/* Viewport Info */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur border rounded-lg p-3 text-sm">
        <div className="font-medium mb-2">Viewport Controls</div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>Left Click + Drag: Rotate</div>
          <div>Right Click + Drag: Pan</div>
          <div>Scroll: Zoom</div>
          <div>Ctrl + Click: Multi-select</div>
        </div>
      </div>
    </div>
  )
}
