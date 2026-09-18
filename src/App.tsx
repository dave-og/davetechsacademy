import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PageLayout } from "./components/layout/PageLayout";
import { ToastProvider } from "./components/ui/Toast";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { useTheme } from "./hooks/useTheme";
import { routes } from "./routes";

const App = () => {
  const { theme, toggleTheme } = useTheme();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <PageLayout theme={theme} onToggleTheme={toggleTheme} />,
      children: routes,
    },
  ]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;

