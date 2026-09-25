import * as React from "react"
import * as RechartsPrimitive from "recharts"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={`flex aspect-video justify-center text-xs ${className || ""}`}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .map(([key, item]) => {
            const color = item.color
            return color ? `[data-chart=${id}] { --color-${key}: ${color}; }` : ""
          })
          .join("\n"),
      }}
    />
  )
}

export const ChartTooltip = RechartsPrimitive.Tooltip

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  label,
  labelFormatter,
  formatter,
}: {
  active?: boolean
  payload?: any[]
  className?: string
  indicator?: "dot" | "line" | "dashed"
  hideLabel?: boolean
  label?: string
  labelFormatter?: (label: any, payload: any[]) => React.ReactNode
  formatter?: (value: any, name: any, item: any, index: number) => React.ReactNode
}) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={`grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-[var(--border-hover)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] shadow-xl ${
        className || ""
      }`}
    >
      {!hideLabel && (
        <div className="font-medium text-[var(--text-secondary)] font-mono">
          {labelFormatter ? labelFormatter(label, payload) : label}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${item.dataKey || item.name || "value"}`
          const itemConfig = config[key] || {}
          const indicatorColor = item.color || item.payload?.fill || itemConfig.color || "var(--accent)"

          return (
            <div
              key={index}
              className="flex w-full items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-1.5">
                {indicator === "dot" && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: indicatorColor }}
                  />
                )}
                <span className="text-[var(--text-secondary)]">
                  {itemConfig.label || item.name}
                </span>
              </div>
              <span className="font-mono font-medium text-[var(--text-primary)]">
                {formatter
                  ? formatter(item.value, item.name, item, index)
                  : typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
