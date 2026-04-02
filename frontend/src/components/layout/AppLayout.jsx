import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-surface-100">
      <Sidebar />
      <div className="flex-1 lg:ml-60 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
