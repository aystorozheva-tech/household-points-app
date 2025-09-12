import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'

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
import ProfileSettings from './pages/ProfileSettings'
import ConfigRooms from './pages/ConfigRooms'
import NewRoom from './pages/NewRoom'
import ChooseRoomIcon from './pages/ChooseRoomIcon'
import EditRoom from './pages/EditRoom'
import ConfigTasks from './pages/ConfigTasks'
import AddChore from './pages/AddChore'
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
import ConfigMembers from './pages/ConfigMembers'
import InviteScreen from './pages/InviteScreen'
import ChooseChoreIcon from './pages/ChooseChoreIcon'
import ChooseRooms from './pages/ChooseRooms'
import EditEntry from './pages/EditEntry'

// AUTH pages (вне AppLayout!)
import Welcome from './pages/auth/Welcome'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PasswordRecovery from './pages/auth/PasswordRecovery'
import EmailConfirmationRequest from './pages/auth/EmailConfirmationRequest'
import EmailConfirmationSuccess from './pages/auth/EmailConfirmationSuccess'
import ConfigureHouse1 from './pages/auth/ConfigureHouse1'
import ConfigureHouseInvite from './pages/auth/ConfigureHouseInvite'
import AllowPush from './pages/auth/AllowPush'
import SignUpComplete from './pages/auth/SignUpComplete'
import NewHouseName from './pages/auth/NewHouseName'
import NewHouseRooms from './pages/auth/NewHouseRooms'
import NewHouseTasks from './pages/auth/NewHouseTasks'

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
      { path: 'password-recovery', element: <PasswordRecovery /> },
      { path: 'email-confirmation', element: <EmailConfirmationRequest /> },
      { path: 'email-confirmed', element: <EmailConfirmationSuccess /> },
      { path: 'home-settings-start', element: <div>HomeSettingsStart (TODO)</div> },
      { path: 'configure-house-1', element: <ConfigureHouse1 /> },
      { path: 'new-house-name', element: <NewHouseName /> },
      { path: 'new-house-rooms', element: <NewHouseRooms /> },
      { path: 'new-house-tasks', element: <NewHouseTasks /> },
      { path: 'configure-house-invite', element: <ConfigureHouseInvite /> },
      { path: 'allow-push', element: <AllowPush /> },
      { path: 'sign-up-complete', element: <SignUpComplete /> },
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
      { path: 'choose-rooms/:id', element: <ChooseRooms /> },
      { path: 'history', element: <History /> },
      { path: 'edit-entry/:id', element: <EditEntry /> },
      { path: 'results', element: <Results /> },
      { path: 'settings', element: <Settings /> },
      { path: 'profile', element: <Profile /> },
      { path: 'profile-settings', element: <ProfileSettings /> },
      { path: 'config/flat', element: <ConfigRooms /> },
      { path: 'new-room', element: <NewRoom /> },
      { path: 'choose-room-icon', element: <ChooseRoomIcon /> },
      { path: 'edit-room/:id', element: <EditRoom /> },
      { path: 'config/tasks', element: <ConfigTasks /> },
      { path: 'config/task/:id', element: <TaskConfig /> },
      { path: 'config/tasks/add', element: <AddChore /> },
      { path: 'config/rewards', element: <ConfigRewards /> },
      { path: 'config/rewards/add', element: <AddReward /> },
      { path: 'config/punishments', element: <ConfigPunishments /> },
      { path: 'config/punishments/add', element: <AddPunishment /> },
      { path: 'config/rewards/:id', element: <EditReward /> },
      { path: 'config/punishments/:id', element: <EditPunishment /> },
      { path: 'config/tasks/:id', element: <EditTask /> },
      { path: 'choose-chore-icon', element: <ChooseChoreIcon /> },
      { path: 'settings/household', element: <HouseholdSettings /> },
      { path: 'household-settings', element: <HouseholdSettings /> },
      { path: 'config-members', element: <ConfigMembers /> },
      { path: 'invite', element: <InviteScreen /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

// Register the service worker to enable PWA features
registerSW({ immediate: true })
