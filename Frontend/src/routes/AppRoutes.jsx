import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/AdminDashboard';
import OrganizationDashboard from '../pages/OrganizationDashboard';
import MemberDashboard from '../pages/MemberDashboard';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import Tasks from '../pages/Tasks';
import Members from '../pages/Members';
import Profile from '../pages/Profile';
import JobDetails from '../pages/JobDetails';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import PlatformAdminRoute from './PlatformAdminRoute';
import PlatformDashboard from '../pages/Platform/Dashboard';
import Organizations from '../pages/Platform/Organizations';
import Users from '../pages/Platform/Users';

const AppRoutes = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

    <Route path="/admin/*" element={
      <PlatformAdminRoute>
        <AppLayout />
      </PlatformAdminRoute>
    }>
      <Route path="" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="organizations" element={<Organizations />} />
      <Route path="users" element={<Users />} />
      <Route path="projects" element={<Projects />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="activity" element={<PlatformDashboard />} />
      <Route path="settings" element={<NotFound isForbidden />} />
    </Route>

    <Route path="/organization/*" element={
      <RoleRoute roles={['org_admin']}>
        <AppLayout />
      </RoleRoute>
    }>
      <Route path="" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<OrganizationDashboard />} />
      <Route path="members" element={<Members />} />
      <Route path="projects" element={<Projects />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="activity" element={<OrganizationDashboard />} />
      <Route path="settings" element={<Profile />} />
    </Route>

    <Route path="/member/*" element={
      <RoleRoute roles={['member']}>
        <AppLayout />
      </RoleRoute>
    }>
      <Route path="" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<MemberDashboard />} />
      <Route path="my-tasks" element={<Tasks />} />
      <Route path="projects" element={<Projects />} />
      <Route path="team" element={<Members />} />
      <Route path="notifications" element={<NotFound isForbidden />} />
      <Route path="profile" element={<Profile />} />
    </Route>

    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:projectId" element={<ProjectDetails />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/jobs/:jobId" element={<JobDetails />} />
      <Route
        path="/members"
        element={
          <RoleRoute roles={['org_admin']}>
            <Members />
          </RoleRoute>
        }
      />
    </Route>

    <Route path="/forbidden" element={<NotFound isForbidden />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
