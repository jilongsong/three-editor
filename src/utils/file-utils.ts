import type { SceneData } from "@/types"

export function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function uploadJSON(): Promise<SceneData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            resolve(data)
          } catch (error) {
            reject(new Error("Invalid JSON file"))
          }
        }
        reader.readAsText(file)
      } else {
        reject(new Error("No file selected"))
      }
    }
    input.click()
  })
}

export function uploadModel(): Promise<{ file: File; url: string }> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".glb,.gltf"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const url = URL.createObjectURL(file)
        resolve({ file, url })
      } else {
        reject(new Error("No file selected"))
      }
    }
    input.click()
  })
}

export function captureCanvas(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png")
}
