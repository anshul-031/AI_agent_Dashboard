import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { View } from './Dashboard'
import { LayoutGrid, Activity, GitBranch } from 'lucide-react'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

const navigationItems = [
  {
    id: 'overview' as const,
    label: 'Agent Overview',
    icon: LayoutGrid,
    description: 'View all agents'
  },
  {
    id: 'execution' as const,
    label: 'Execution History',
    icon: Activity,
    description: 'Monitor executions'
  },
  {
    id: 'flowchart' as const,
    label: 'Flowchart View',
    icon: GitBranch,
    description: 'Visual workflows'
  }
]

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start h-12',
                  currentView === item.id && 'shadow-sm'
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}