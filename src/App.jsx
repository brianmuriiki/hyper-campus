import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { useAuthListener } from './hooks/useAuthListener'
import Splash from './app/Splash'
import Home from './app/Home'
import Login from './app/Login'
import Register from './app/Register'
import Placeholder from './app/Placeholder'
import AppShell from './app/AppShell'
import Repository from './app/Repository'
import UnitDetail from './app/UnitDetail'
import HyperChat from './app/HyperChat'

const queryClient = new QueryClient()

export default function App() {
  useAuthListener()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/app" element={<AppShell />}>
            <Route path="repository" element={<Repository />} />
            <Route path="repository/:unitId" element={<UnitDetail />} />
            <Route path="hyper-chat" element={<HyperChat />} />
            <Route path="discussion" element={<Placeholder label="Discussion" />} />
            <Route path="analysis" element={<Placeholder label="Analysis" />} />
            <Route path="profile" element={<Placeholder label="Profile" />} />
          </Route>

          <Route path="/admin/*" element={<Placeholder label="Admin" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}