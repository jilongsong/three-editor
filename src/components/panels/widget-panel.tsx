"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Code, Database } from "lucide-react"
import { useEditorStore } from "@/stores/editor-store"
import { widgetTemplates, defaultWidgetStyle } from "@/utils/widget-templates"
import type { SceneObject, HtmlWidget, DataSource, WidgetTemplate } from "@/types"

interface WidgetPanelProps {
  object: SceneObject
  onUpdate: (id: string, updates: Partial<SceneObject>) => void
}

export function WidgetPanel({ object, onUpdate }: WidgetPanelProps) {
  const { dataSources, addDataSource } = useEditorStore()
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isDataSourceDialogOpen, setIsDataSourceDialogOpen] = useState(false)

  const widget = object.htmlWidget

  if (!widget) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>HTML Widget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">This object is not an HTML widget</p>
            <Button
              onClick={() => {
                const newWidget: HtmlWidget = {
                  id: `widget_${Date.now()}`,
                  name: "New Widget",
                  template: "<div>Hello World!</div>",
                  style: defaultWidgetStyle,
                  autoRefresh: false,
                  refreshInterval: 5000,
                  position3D: { x: 0, y: 0, z: 0 },
                  lookAtCamera: true,
                  scale3D: 1,
                }
                onUpdate(object.id, { htmlWidget: newWidget })
              }}
            >
              Convert to HTML Widget
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleWidgetUpdate = (updates: Partial<HtmlWidget>) => {
    onUpdate(object.id, {
      htmlWidget: { ...widget, ...updates },
    })
  }

  const handleStyleUpdate = (styleUpdates: Partial<HtmlWidget["style"]>) => {
    handleWidgetUpdate({
      style: { ...widget.style, ...styleUpdates },
    })
  }

  const handleApplyTemplate = (template: WidgetTemplate) => {
    handleWidgetUpdate({
      template: template.template,
      style: template.style,
    })
    setIsTemplateDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Widget Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            Widget Templates
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Code className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Choose Widget Template</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-2 gap-4 p-1">
                    {widgetTemplates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <span className="text-lg">{template.icon}</span>
                            {template.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                            onClick={() => handleApplyTemplate(template)}
                          >
                            Apply Template
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Widget Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Widget Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div>
                <Label>Widget Name</Label>
                <Input
                  value={widget.name}
                  onChange={(e) => handleWidgetUpdate({ name: e.target.value })}
                  placeholder="Enter widget name"
                />
              </div>

              <div>
                <Label>HTML Template</Label>
                <Textarea
                  value={widget.template}
                  onChange={(e) => handleWidgetUpdate({ template: e.target.value })}
                  placeholder="Enter HTML template with {{variables}}"
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {"{{variable}}"} for data binding and {"{{#each array}}"} for loops
                </p>
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Width</Label>
                  <Input
                    type="number"
                    value={widget.style.width}
                    onChange={(e) => handleStyleUpdate({ width: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Height</Label>
                  <Input
                    type="number"
                    value={widget.style.height}
                    onChange={(e) => handleStyleUpdate({ height: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={widget.style.backgroundColor}
                    onChange={(e) => handleStyleUpdate({ backgroundColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={widget.style.backgroundColor}
                    onChange={(e) => handleStyleUpdate({ backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={widget.style.color}
                    onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={widget.style.color}
                    onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Border Radius: {widget.style.borderRadius}px</Label>
                <Slider
                  value={[widget.style.borderRadius]}
                  onValueChange={([value]) => handleStyleUpdate({ borderRadius: value })}
                  max={50}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Padding: {widget.style.padding}px</Label>
                <Slider
                  value={[widget.style.padding]}
                  onValueChange={([value]) => handleStyleUpdate({ padding: value })}
                  max={50}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Font Size: {widget.style.fontSize}px</Label>
                <Slider
                  value={[widget.style.fontSize]}
                  onValueChange={([value]) => handleStyleUpdate({ fontSize: value })}
                  max={32}
                  min={8}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Opacity: {widget.style.opacity.toFixed(2)}</Label>
                <Slider
                  value={[widget.style.opacity]}
                  onValueChange={([value]) => handleStyleUpdate({ opacity: value })}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Data Source</Label>
                <Dialog open={isDataSourceDialogOpen} onOpenChange={setIsDataSourceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Database className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Data Source</DialogTitle>
                    </DialogHeader>
                    <DataSourceEditor
                      onSave={(dataSource) => {
                        addDataSource(dataSource)
                        handleWidgetUpdate({ dataSourceId: dataSource.id })
                        setIsDataSourceDialogOpen(false)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <Select
                value={widget.dataSourceId || "none"}
                onValueChange={(value) => handleWidgetUpdate({ dataSourceId: value === "none" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No data source</SelectItem>
                  {Object.values(dataSources).map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name} ({source.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Separator />

              <div className="flex items-center justify-between">
                <Label>Auto Refresh</Label>
                <Switch
                  checked={widget.autoRefresh}
                  onCheckedChange={(autoRefresh) => handleWidgetUpdate({ autoRefresh })}
                />
              </div>

              {widget.autoRefresh && (
                <div>
                  <Label>Refresh Interval (ms)</Label>
                  <Input
                    type="number"
                    value={widget.refreshInterval}
                    onChange={(e) => handleWidgetUpdate({ refreshInterval: Number(e.target.value) })}
                    min={1000}
                    step={1000}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div>
                <Label>3D Scale: {widget.scale3D.toFixed(2)}</Label>
                <Slider
                  value={[widget.scale3D]}
                  onValueChange={([value]) => handleWidgetUpdate({ scale3D: value })}
                  max={5}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Always Face Camera</Label>
                <Switch
                  checked={widget.lookAtCamera}
                  onCheckedChange={(lookAtCamera) => handleWidgetUpdate({ lookAtCamera })}
                />
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Widget ID: {widget.id}</div>
                <div>Template Length: {widget.template.length} characters</div>
                <div>Data Source: {widget.dataSourceId ? "Connected" : "None"}</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function DataSourceEditor({ onSave }: { onSave: (dataSource: DataSource) => void }) {
  const [dataSource, setDataSource] = useState<Partial<DataSource>>({
    name: "",
    type: "static",
    data: {},
    interval: 5000,
  })

  const handleSave = () => {
    const newDataSource: DataSource = {
      id: `ds_${Date.now()}`,
      name: dataSource.name || "Untitled Data Source",
      type: dataSource.type || "static",
      url: dataSource.url,
      method: dataSource.method || "GET",
      headers: dataSource.headers || {},
      body: dataSource.body,
      interval: dataSource.interval || 5000,
      data: dataSource.data || {},
    }
    onSave(newDataSource)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={dataSource.name}
          onChange={(e) => setDataSource({ ...dataSource, name: e.target.value })}
          placeholder="Enter data source name"
        />
      </div>

      <div>
        <Label>Type</Label>
        <Select value={dataSource.type} onValueChange={(type: any) => setDataSource({ ...dataSource, type })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="static">Static Data</SelectItem>
            <SelectItem value="api">API Endpoint</SelectItem>
            <SelectItem value="interval">Interval Update</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {dataSource.type === "api" && (
        <>
          <div>
            <Label>URL</Label>
            <Input
              value={dataSource.url}
              onChange={(e) => setDataSource({ ...dataSource, url: e.target.value })}
              placeholder="https://api.example.com/data"
            />
          </div>
          <div>
            <Label>Method</Label>
            <Select value={dataSource.method} onValueChange={(method: any) => setDataSource({ ...dataSource, method })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div>
        <Label>Sample Data (JSON)</Label>
        <Textarea
          value={JSON.stringify(dataSource.data, null, 2)}
          onChange={(e) => {
            try {
              const data = JSON.parse(e.target.value)
              setDataSource({ ...dataSource, data })
            } catch (error) {
              // Invalid JSON, ignore
            }
          }}
          placeholder='{"key": "value"}'
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      <Button onClick={handleSave} className="w-full">
        Create Data Source
      </Button>
    </div>
  )
}
