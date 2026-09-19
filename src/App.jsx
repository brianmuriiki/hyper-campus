import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Splash from './app/Splash'
import Home from './app/Home'
import Placeholder from './app/Placeholder'
import AppShell from './app/AppShell'
import Login from './app/Login'
import Register from './app/Register'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/app" element={<AppShell />}>
            <Route path="repository" element={<Placeholder label="Repository" />} />
            <Route path="hyper-chat" element={<Placeholder label="Hyper-Chat" />} />
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