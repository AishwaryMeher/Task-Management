import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();

  const userName = user?.name || "Guest";
  const nameParts = user?.name?.trim().split(" ") || [];
  const userInitial =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : nameParts[0]?.[0]?.toUpperCase() || "G";

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-500 focus:outline-none md:hidden"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white ml-2 md:ml-0">
            <Link to={"/"}>TaskPop</Link>
          </h1>
        </div>

        <div className="flex items-center">
          <div className="ml-3 relative">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                {userInitial}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-white hidden md:block">
                {userName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
