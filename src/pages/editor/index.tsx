import { Suspense, useCallback, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Stats, Environment, GizmoHelper, GizmoViewport } from "@react-three/drei"
import { Toolbar } from "@/components/ui/toolbar"
import { StatusBar } from "@/components/ui/status-bar"
import { ToolsPanel } from "@/components/panels/tools-panel"
import { HierarchyPanel } from "@/components/panels/hierarchy-panel"
import { ObjectPanel } from "@/components/panels/object-panel"
import { SceneObjectComponent } from "@/components/scene-object"
import { useKeyboard } from "@/hooks/use-keyboard"
import { useAnimation } from "@/hooks/use-animation"
import { useEditorStore } from "@/stores/editor-store"

interface EditorProps {
  layout?: 'full' | 'canvas-only';
  data?: any;
  onEditorChange?: (e: any) => void;
}

export default function Editor({ layout = 'canvas-only', data }: EditorProps) {
  const { objects, selectedObjects, selectObjects, showGrid, showStats, gridSize, isTransforming, importScene } = useEditorStore()
  const orbitControlsRef = useRef<any>(null)

  useKeyboard()
  useAnimation()

  const handleObjectSelect = useCallback(
    (id: string, event: any) => {
      if (event.nativeEvent?.ctrlKey || event.nativeEvent?.metaKey) {
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

  const handleCanvasClick = useCallback(() => {
    selectObjects([])
  }, [selectObjects])

  useEffect(() => {
    console.log('data', data);
    if (data) {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        importScene(parsedData);
      } catch (error) {
        console.error('Failed to parse data:', error);
      }
    }
  }, [data]);

  return (
    <div
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      className="bg-background"
    >
      {/* Top Toolbar */}
      {layout === 'full' && <Toolbar />}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar */}
        {layout === 'full' && (
          <div className="w-80 border-r bg-card flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <ToolsPanel />
              <HierarchyPanel />
            </div>
          </div>
        )}

        {/* Viewport */}
        <div
          style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}
          className="relative bg-gradient-to-br from-slate-50 to-slate-100"
        >

          <Canvas
            camera={{ position: [5, 5, 5], fov: 60 }}
            shadows
            onPointerMissed={handleCanvasClick}
            style={layout === 'canvas-only' ? { width: '100%', height: '100%' } : undefined}
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

              {/* Controls - Disabled when transforming */}
              <OrbitControls
                ref={orbitControlsRef}
                enabled={!isTransforming}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                target={[0, 0, 0]}
                maxPolarAngle={Math.PI / 2}
                minDistance={1}
                maxDistance={100}
                dampingFactor={0.05}
                enableDamping={true}
              />

              {/* Environment */}
              <Environment preset="studio" />

              {/* Gizmo */}
              <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport axisColors={["#ff6b35", "#4ade80", "#3b82f6"]} labelColor="black" />
              </GizmoHelper>

              {/* Stats positioned in top right */}
              {showStats && layout === 'full' && <StatsComponent />}
            </Suspense>
          </Canvas>

          {/* Transform Status Indicator */}
          {isTransforming && (
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
              Transforming Object
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {layout === 'full' && (
          <div className="w-80 border-l bg-card">
            <div className="h-full overflow-y-auto p-4">
              <ObjectPanel />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      {layout === 'full' && <StatusBar />}
    </div>
  )
}

// Custom Stats component that positions itself in the top right
function StatsComponent() {
  return <Stats showPanel={0} className="stats-container" />
}
