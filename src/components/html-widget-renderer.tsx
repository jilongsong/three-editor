"use client"

import { useEffect, useState, useRef } from "react"
import { useEditorStore } from "@/stores/editor-store"
import { renderTemplate, fetchDataFromSource } from "@/utils/widget-templates"
import type { HtmlWidget, WidgetData } from "@/types"

interface HtmlWidgetRendererProps {
  widget: HtmlWidget
}

export function HtmlWidgetRenderer({ widget }: HtmlWidgetRendererProps) {
  const { dataSources } = useEditorStore()
  const [renderedHtml, setRenderedHtml] = useState("")
  const [widgetData, setWidgetData] = useState<WidgetData>({
    title: "Sample Widget",
    description: "This is a sample HTML widget",
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // 获取数据源 - 使用稳定的引用
  const dataSource = widget.dataSourceId ? dataSources[widget.dataSourceId] : null
  const dataSourceId = widget.dataSourceId

  // 更新数据的函数
  const updateData = async () => {
    if (!mountedRef.current) return

    if (dataSource) {
      try {
        const newData = await fetchDataFromSource(dataSource)
        if (mountedRef.current) {
          setWidgetData(newData)
        }
      } catch (error) {
        console.error("Failed to update widget data:", error)
        if (mountedRef.current) {
          setWidgetData(dataSource.data || {})
        }
      }
    } else {
      // 使用默认数据
      if (mountedRef.current) {
        setWidgetData({
          title: "Sample Widget",
          description: "This is a sample HTML widget",
        })
      }
    }
  }

  // 渲染HTML - 使用稳定的依赖
  useEffect(() => {
    if (!mountedRef.current) return

    try {
      const html = renderTemplate(widget.template, widgetData)
      setRenderedHtml(html)
    } catch (error) {
      console.error("Failed to render template:", error)
      setRenderedHtml("<div>Error rendering template</div>")
    }
  }, [widget.template, widgetData])

  // 初始数据加载 - 只在数据源ID变化时触发
  useEffect(() => {
    updateData()
  }, [dataSourceId]) // 只依赖ID，不依赖整个对象

  // 设置自动刷新 - 使用稳定的依赖
  useEffect(() => {
    if (!widget.autoRefresh || widget.refreshInterval <= 0) {
      return
    }

    intervalRef.current = setInterval(() => {
      updateData()
    }, widget.refreshInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [widget.autoRefresh, widget.refreshInterval, dataSourceId]) // 使用ID而不是对象

  // 组件卸载时的清理
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div
      style={{
        width: widget.style.width,
        height: widget.style.height,
        backgroundColor: widget.style.backgroundColor,
        borderRadius: widget.style.borderRadius,
        padding: widget.style.padding,
        fontSize: widget.style.fontSize,
        fontFamily: widget.style.fontFamily,
        color: widget.style.color,
        border: widget.style.border,
        boxShadow: widget.style.boxShadow,
        opacity: widget.style.opacity,
        overflow: "hidden",
        pointerEvents: "none",
        userSelect: "none",
        position: "relative",
      }}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  )
}
