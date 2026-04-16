import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-60 min-w-0">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
