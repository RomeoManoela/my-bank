import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './ui/AppLayout.tsx'
import Home from './ui/Home.tsx'
import Service from './ui/Service.tsx'
import Registration from './pages/Registration.tsx'
import Login from './pages/Login.tsx'
import { login_action, registration_action } from './services/actions.ts'
import ProtectedRoute from './services/ProtectedRoute.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Error from './ui/Error.tsx'

const router = createBrowserRouter([
  {
    element: <AppLayout />,

    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        element: <ProtectedRoute />,
        errorElement: <Error />,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />,
            errorElement: <Error />,
          },
        ],
      },
      {
        path: 'service',
        element: <Service />,
      },
      {
        path: 'register',
        element: <Registration />,
        action: registration_action,
      },
      {
        path: 'login',
        element: <Login />,
        action: login_action,
      },
    ],
  },
])

function App(): React.ReactElement {
  return <RouterProvider router={router} />
}

export default App
