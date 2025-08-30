import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'

import AppLayout from './AppLayout'

// APP pages (под AppLayout)
import Home from './pages/Home'
import ChooseTask from './pages/ChooseTask'
import AddTask from './pages/AddTask'
import RewardSelect from './pages/RewardSelect'
import PunishSelect from './pages/PunishSelect'
import History from './pages/History'
import Results from './pages/Results'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import ConfigRooms from './pages/ConfigRooms'
import ConfigTasks from './pages/ConfigTasks'
import TaskConfig from './pages/TaskConfig'
import AddCustomTask from './pages/AddCustomTask'
import ConfigRewards from './pages/ConfigRewards'
import AddReward from './pages/AddReward'
import ConfigPunishments from './pages/ConfigPunishments'
import AddPunishment from './pages/AddPunishment'
import EditReward from './pages/EditReward'
import EditPunishment from './pages/EditPunishment'
import EditTask from './pages/EditTask'
import HouseholdSettings from './pages/HouseholdSettings'

// AUTH pages (вне AppLayout!)
import Welcome from './pages/auth/Welcome'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import FamilySetup from './pages/auth/FamilySetup'

// простая обёртка для auth-ветки
function AuthShell() {
  return <div><OutletPlaceholder /></div>
}
// нужен Outlet внутри элемента
import { Outlet } from 'react-router-dom'
function OutletPlaceholder() { return <Outlet /> }

const router = createHashRouter([
  // Ветка AUTH — без AppLayout
  {
    path: '/auth',
    element: <AuthShell />,
    children: [
      { index: true, element: <Welcome /> },
      { path: 'welcome', element: <Welcome /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'family', element: <FamilySetup /> },
    ],
  },

  // Ветка APP — со всем приложением под AppLayout
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'choose', element: <ChooseTask /> },
      { path: 'add/:kind', element: <AddTask /> },
      { path: 'add/custom/:id', element: <AddTask /> },
      { path: 'reward', element: <RewardSelect /> },
      { path: 'punish', element: <PunishSelect /> },
      { path: 'history', element: <History /> },
      { path: 'results', element: <Results /> },
      { path: 'settings', element: <Settings /> },
      { path: 'profile', element: <Profile /> },
      { path: 'config/flat', element: <ConfigRooms /> },
      { path: 'config/tasks', element: <ConfigTasks /> },
      { path: 'config/task/:id', element: <TaskConfig /> },
      { path: 'config/tasks/add', element: <AddCustomTask /> },
      { path: 'config/rewards', element: <ConfigRewards /> },
      { path: 'config/rewards/add', element: <AddReward /> },
      { path: 'config/punishments', element: <ConfigPunishments /> },
      { path: 'config/punishments/add', element: <AddPunishment /> },
      { path: 'config/rewards/:id', element: <EditReward /> },
      { path: 'config/punishments/:id', element: <EditPunishment /> },
      { path: 'config/tasks/:id', element: <EditTask /> },
      { path: 'settings/household', element: <HouseholdSettings /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)