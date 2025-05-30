import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Monitor, LogOut } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Theme Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`p-4 rounded-lg border-2 flex items-center space-x-3 ${
                theme === "light"
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <Sun className="h-5 w-5 text-orange-500" />
              <span className="text-gray-900 dark:text-white">Light</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-lg border-2 flex items-center space-x-3 ${
                theme === "dark"
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <Moon className="h-5 w-5 text-indigo-500" />
              <span className="text-gray-900 dark:text-white">Dark</span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`p-4 rounded-lg border-2 flex items-center space-x-3 ${
                theme === "system"
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <Monitor className="h-5 w-5 text-gray-500" />
              <span className="text-gray-900 dark:text-white">System</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Account
          </h2>
          <button
            onClick={handleLogout}
            className="w-full max-w-[10rem] bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <LogOut />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
