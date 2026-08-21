import type { ReactNode } from "react"

export default function CosmosDecorator({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {children}
    </div>
  )
}
