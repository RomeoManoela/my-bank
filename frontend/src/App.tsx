import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './ui/AppLayout.tsx'
import Home from './ui/Home.tsx'
import Service from './ui/Service.tsx'
import Registration from './pages/Registration.tsx'
import { registration_action } from './services/actions.ts'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
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
        element: <Registration />,
      },
    ],
  },
])

function App(): React.ReactElement {
  return <RouterProvider router={router} />
}

export default App
