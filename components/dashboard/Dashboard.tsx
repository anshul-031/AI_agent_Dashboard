'use client'

import { useState, useEffect } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { AgentOverview } from './views/AgentOverview'
import { AgentExecution } from './views/AgentExecution'
import { AgentFlowchart } from './views/AgentFlowchart'

export type View = 'overview' | 'execution' | 'flowchart'

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('overview')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  // Persist selected agent in session storage
  useEffect(() => {
    const savedAgentId = sessionStorage.getItem('selectedAgentId')
    if (savedAgentId) {
      setSelectedAgentId(savedAgentId)
    }
  }, [])

  useEffect(() => {
    if (selectedAgentId) {
      sessionStorage.setItem('selectedAgentId', selectedAgentId)
    } else {
      sessionStorage.removeItem('selectedAgentId')
    }
  }, [selectedAgentId])

  const handleViewChange = (view: View) => {
    setCurrentView(view)
    
    // If navigating to execution or flowchart without an agent selected,
    // and there's no persisted agent, redirect to overview
    if ((view === 'execution' || view === 'flowchart') && !selectedAgentId) {
      const savedAgentId = sessionStorage.getItem('selectedAgentId')
      if (!savedAgentId) {
        // For flowchart view, we'll show the agent selector instead of redirecting
        if (view === 'execution') {
          setCurrentView('overview')
        }
      }
    }
  }

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
        return (
          <AgentFlowchart 
            agentId={selectedAgentId}
            onAgentSelect={(agentId) => {
              setSelectedAgentId(agentId)
            }}
          />
        )
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
          onViewChange={handleViewChange}
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