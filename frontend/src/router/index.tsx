import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '@/layouts/RootLayout'
import AuthLayout from '@/layouts/AuthLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { PageLoader } from '@/components/shared/PageLoader'

const HomePage = lazy(() => import('@/pages/HomePage'))
const AllRecipesPage = lazy(() => import('@/pages/AllRecipesPage'))
const RecipeDetailPage = lazy(() => import('@/pages/RecipeDetailPage'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))
const CommunityPage = lazy(() => import('@/pages/CommunityPage'))
const PostRecipePage = lazy(() => import('@/pages/PostRecipePage'))
const MyRecipesPage = lazy(() => import('@/pages/MyRecipesPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SavedRecipesPage = lazy(() => import('@/pages/SavedRecipesPage'))
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const EditRecipePage = lazy(() => import('@/pages/EditRecipePage'))

const wrap = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
)

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: wrap(<HomePage />) },
      { path: '/recipes', element: wrap(<AllRecipesPage />) },
      { path: '/recipes/:id', element: wrap(<RecipeDetailPage />) },
      {
        path: '/recipes/:id/edit',
        element: wrap(
          <ProtectedRoute>
            <EditRecipePage />
          </ProtectedRoute>,
        ),
      },
      { path: '/community', element: wrap(<CommunityPage />) },
      { path: '/categories', element: wrap(<CategoriesPage />) },
      {
        path: '/post-recipe',
        element: wrap(
          <ProtectedRoute>
            <PostRecipePage />
          </ProtectedRoute>,
        ),
      },
      {
        path: '/my-recipes',
        element: wrap(
          <ProtectedRoute>
            <MyRecipesPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: '/profile',
        element: wrap(
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>,
        ),
      },
      {
        path: '/saved-recipes',
        element: wrap(
          <ProtectedRoute>
            <SavedRecipesPage />
          </ProtectedRoute>,
        ),
      },
      { path: '*', element: wrap(<NotFoundPage />) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: '/auth', element: wrap(<AuthPage />) }],
  },
])
