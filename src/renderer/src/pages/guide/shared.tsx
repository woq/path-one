import React from 'react'

export const GuidePage: React.FC<{
  eyebrow?: string
  title: string
  lead: string
  children: React.ReactNode
}> = ({ eyebrow = '使用说明', title, lead, children }) => (
  <div className="max-w-3xl mx-auto space-y-5 pb-8">
    <header className="space-y-2">
      <p className="text-xs tracking-[0.2em] uppercase text-fx-muted/70">{eyebrow}</p>
      <h1 className="text-3xl font-semibold text-fx-text tracking-tight">{title}</h1>
      <p className="text-sm text-fx-muted leading-relaxed">{lead}</p>
    </header>
    {children}
  </div>
)

export const GuideSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children
}) => (
  <section className="fx-panel rounded-2xl p-6 space-y-3 select-text">
    <h2 className="text-base font-medium text-fx-text">{title}</h2>
    <div className="text-sm text-fx-muted leading-relaxed space-y-3">{children}</div>
  </section>
)
