'use client'

import { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { AgentOverview } from './views/AgentOverview'
import { AgentExecution } from './views/AgentExecution'
import { AgentFlowchart } from './views/AgentFlowchart'

export type View = 'overview' | 'execution' | 'flowchart'

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('overview')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <AgentOverview 
            onAgentSelect={(agentId) => {
              setSelectedAgentId(agentId)
              setCurrentView('execution')
            }}
          />
        )
      case 'execution':
        return (
          <AgentExecution 
            agentId={selectedAgentId}
            onViewFlowchart={(agentId) => {
              setSelectedAgentId(agentId)
              setCurrentView('flowchart')
            }}
            onBack={() => {
              setCurrentView('overview')
              setSelectedAgentId(null)
            }}
          />
        )
      case 'flowchart':
        return <AgentFlowchart agentId={selectedAgentId} />
      default:
        return <AgentOverview onAgentSelect={() => {}} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
        />
        <main className="flex-1 p-6 lg:p-8">
          <div className="animate-fade-in">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}