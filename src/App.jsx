import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { useAuthListener } from './hooks/useAuthListener'
import Splash from './app/Splash'
import Home from './app/Home'
import Login from './app/Login'
import Register from './app/Register'
import CompleteProfile from './app/CompleteProfile'
import AppShell from './app/AppShell'
import Repository from './app/Repository'
import UnitDetail from './app/UnitDetail'
import HyperChat from './app/HyperChat'
import Discussion from './app/Discussion'
import RoomChat from './app/RoomChat'
import Profile from './app/Profile'
import Analysis from './app/Analysis'
import AdminShell from './app/AdminShell'
import AdminUsers from './app/AdminUsers'
import AdminMetrics from './app/AdminMetrics'
import AdminModerationLog from './app/AdminModerationLog'
import AdminSendNews from './app/AdminSendNews'

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
          <Route path="/complete-profile" element={<CompleteProfile />} />

          <Route path="/app" element={<AppShell />}>
            <Route path="repository" element={<Repository />} />
            <Route path="repository/:unitId" element={<UnitDetail />} />
            <Route path="hyper-chat" element={<HyperChat />} />
            <Route path="discussion" element={<Discussion />} />
            <Route path="discussion/:roomId" element={<RoomChat />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="profile" element={<Profile />} />

          </Route>

          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="metrics" element={<AdminMetrics />} />
            <Route path="moderation-log" element={<AdminModerationLog />} />
            <Route path="send-news" element={<AdminSendNews />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
