import type { WidgetTemplate, WidgetStyle } from "@/types"

// 默认样式
export const defaultWidgetStyle: WidgetStyle = {
  width: 300,
  height: 200,
  backgroundColor: "#ffffff",
  borderRadius: 8,
  padding: 16,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  color: "#1f2937",
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  opacity: 1,
}

// Widget 模板
export const widgetTemplates: WidgetTemplate[] = [
  {
    id: "data-card",
    name: "数据卡片",
    description: "显示关键指标的数据卡片",
    icon: "📊",
    template: `
      <div class="data-card">
        <div class="header">
          <h3>{{title}}</h3>
          <span class="badge {{status}}">{{status}}</span>
        </div>
        <div class="value">{{value}}</div>
        <div class="subtitle">{{subtitle}}</div>
        <div class="trend {{trendDirection}}">
          <span class="arrow">{{trendDirection === 'up' ? '↗' : '↘'}}</span>
          {{trendValue}}%
        </div>
      </div>
      <style>
        .data-card { height: 100%; display: flex; flex-direction: column; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .header h3 { margin: 0; font-size: 16px; font-weight: 600; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .badge.online { background: #dcfce7; color: #166534; }
        .badge.offline { background: #fef2f2; color: #dc2626; }
        .value { font-size: 32px; font-weight: 700; margin: 8px 0; }
        .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 12px; }
        .trend { display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 500; }
        .trend.up { color: #059669; }
        .trend.down { color: #dc2626; }
        .arrow { font-size: 16px; }
      </style>
    `,
    style: defaultWidgetStyle,
    sampleData: {
      title: "服务器状态",
      status: "online",
      value: "99.9%",
      subtitle: "系统正常运行",
      trendDirection: "up",
      trendValue: "2.5",
    },
  },
  {
    id: "chart-widget",
    name: "图表组件",
    description: "简单的条形图展示",
    icon: "📈",
    template: `
      <div class="chart-widget">
        <h3>{{title}}</h3>
        <div class="chart-container">
          {{#each data}}
          <div class="chart-bar">
            <div class="bar" style="height: {{percentage}}%"></div>
            <div class="label">{{label}}</div>
            <div class="value">{{value}}</div>
          </div>
          {{/each}}
        </div>
      </div>
      <style>
        .chart-widget h3 { margin: 0 0 16px 0; font-size: 16px; font-weight: 600; }
        .chart-container { display: flex; gap: 12px; height: 120px; align-items: end; }
        .chart-bar { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .bar { width: 100%; background: linear-gradient(to top, #3b82f6, #60a5fa); border-radius: 4px 4px 0 0; min-height: 4px; }
        .label { margin-top: 8px; font-size: 12px; color: #6b7280; }
        .value { font-size: 14px; font-weight: 600; margin-top: 4px; }
      </style>
    `,
    style: { ...defaultWidgetStyle, height: 250 },
    sampleData: {
      title: "月度销售",
      data: [
        { label: "一月", value: "120", percentage: 60 },
        { label: "二月", value: "180", percentage: 90 },
        { label: "三月", value: "150", percentage: 75 },
        { label: "四月", value: "200", percentage: 100 },
      ],
    },
  },
  {
    id: "user-profile",
    name: "用户资料",
    description: "用户信息展示卡片",
    icon: "👤",
    template: `
      <div class="user-profile">
        <div class="avatar">
          <img src="{{avatar}}" alt="{{name}}" />
        </div>
        <div class="info">
          <h3>{{name}}</h3>
          <p class="role">{{role}}</p>
          <p class="email">{{email}}</p>
          <div class="stats">
            <div class="stat">
              <span class="number">{{projects}}</span>
              <span class="label">项目</span>
            </div>
            <div class="stat">
              <span class="number">{{tasks}}</span>
              <span class="label">任务</span>
            </div>
          </div>
        </div>
      </div>
      <style>
        .user-profile { display: flex; gap: 16px; }
        .avatar img { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; }
        .info { flex: 1; }
        .info h3 { margin: 0 0 4px 0; font-size: 18px; font-weight: 600; }
        .role { margin: 0 0 8px 0; color: #3b82f6; font-weight: 500; }
        .email { margin: 0 0 16px 0; color: #6b7280; font-size: 14px; }
        .stats { display: flex; gap: 24px; }
        .stat { text-align: center; }
        .stat .number { display: block; font-size: 20px; font-weight: 700; color: #1f2937; }
        .stat .label { font-size: 12px; color: #6b7280; }
      </style>
    `,
    style: { ...defaultWidgetStyle, height: 160 },
    sampleData: {
      name: "张三",
      role: "前端开发工程师",
      email: "zhangsan@example.com",
      avatar: "/placeholder.svg?height=64&width=64",
      projects: "12",
      tasks: "34",
    },
  },
  {
    id: "notification",
    name: "通知消息",
    description: "系统通知和消息展示",
    icon: "🔔",
    template: `
      <div class="notification {{type}}">
        <div class="icon">{{icon}}</div>
        <div class="content">
          <h4>{{title}}</h4>
          <p>{{message}}</p>
          <div class="time">{{time}}</div>
        </div>
      </div>
      <style>
        .notification { display: flex; gap: 12px; padding: 16px; border-radius: 8px; }
        .notification.success { background: #f0fdf4; border-left: 4px solid #22c55e; }
        .notification.warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
        .notification.error { background: #fef2f2; border-left: 4px solid #ef4444; }
        .notification.info { background: #eff6ff; border-left: 4px solid #3b82f6; }
        .icon { font-size: 24px; }
        .content { flex: 1; }
        .content h4 { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; }
        .content p { margin: 0 0 8px 0; color: #4b5563; line-height: 1.5; }
        .time { font-size: 12px; color: #9ca3af; }
      </style>
    `,
    style: { ...defaultWidgetStyle, height: 140 },
    sampleData: {
      type: "success",
      icon: "✅",
      title: "部署成功",
      message: "您的应用已成功部署到生产环境",
      time: "2分钟前",
    },
  },
  {
    id: "weather-widget",
    name: "天气组件",
    description: "天气信息展示",
    icon: "🌤️",
    template: `
      <div class="weather-widget">
        <div class="current">
          <div class="temp">{{temperature}}°</div>
          <div class="icon">{{weatherIcon}}</div>
        </div>
        <div class="info">
          <h3>{{city}}</h3>
          <p class="condition">{{condition}}</p>
          <div class="details">
            <span>湿度: {{humidity}}%</span>
            <span>风速: {{windSpeed}} km/h</span>
          </div>
        </div>
      </div>
      <style>
        .weather-widget { display: flex; gap: 16px; }
        .current { display: flex; flex-direction: column; align-items: center; }
        .temp { font-size: 48px; font-weight: 700; color: #1f2937; }
        .icon { font-size: 32px; }
        .info { flex: 1; }
        .info h3 { margin: 0 0 8px 0; font-size: 18px; font-weight: 600; }
        .condition { margin: 0 0 16px 0; color: #6b7280; font-size: 16px; }
        .details { display: flex; flex-direction: column; gap: 4px; }
        .details span { font-size: 14px; color: #9ca3af; }
      </style>
    `,
    style: { ...defaultWidgetStyle, height: 180 },
    sampleData: {
      temperature: "22",
      weatherIcon: "☀️",
      city: "北京",
      condition: "晴朗",
      humidity: "45",
      windSpeed: "12",
    },
  },
]

// 模板引擎 - 简单的 Handlebars 风格模板
export function renderTemplate(template: string, data: any): string {
  if (!template || typeof template !== "string") {
    return "<div>Invalid template</div>"
  }

  if (!data || typeof data !== "object") {
    data = {}
  }

  try {
    let result = template

    // 处理简单变量替换 {{variable}}
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match
    })

    // 处理嵌套属性 {{object.property}}
    result = result.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
      const value = path.split(".").reduce((obj: any, key: string) => obj?.[key], data)
      return value !== undefined ? String(value) : match
    })

    // 处理条件渲染 {{#each array}}
    result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, arrayKey, itemTemplate) => {
      const array = data[arrayKey]
      if (!Array.isArray(array)) return ""

      return array
        .map((item) => {
          let itemHtml = itemTemplate
          // 替换每个项目的属性
          Object.keys(item).forEach((key) => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g")
            itemHtml = itemHtml.replace(regex, String(item[key]))
          })
          return itemHtml
        })
        .join("")
    })

    return result
  } catch (error) {
    console.error("Template rendering error:", error)
    return "<div>Template rendering error</div>"
  }
}

// 数据源管理
export async function fetchDataFromSource(dataSource: any): Promise<any> {
  if (!dataSource) {
    return {}
  }

  try {
    switch (dataSource.type) {
      case "api":
        const response = await fetch(dataSource.url, {
          method: dataSource.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...dataSource.headers,
          },
          body: dataSource.method !== "GET" ? dataSource.body : undefined,
        })
        return await response.json()

      case "static":
        return dataSource.data || {}

      case "interval":
        // 模拟定时更新的数据
        return {
          ...dataSource.data,
          timestamp: new Date().toISOString(),
          randomValue: Math.floor(Math.random() * 100),
        }

      default:
        return dataSource.data || {}
    }
  } catch (error) {
    console.error("Failed to fetch data:", error)
    return dataSource.data || {}
  }
}
