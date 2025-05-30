import { NavLink, Link } from "react-router-dom";
import {
  Home,
  Users,
  FolderKanban,
  CheckSquare,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { to: "/teams", label: "Team Members", icon: <Users size={20} /> },
    { to: "/projects", label: "Projects", icon: <FolderKanban size={20} /> },
    { to: "/tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
  ];

  const sidebarClasses = `bg-indigo-700 text-white w-full max-w-[16rem] min-[2000px]:max-w-xs flex-shrink-0 fixed md:static inset-y-0 left-0 transform ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0 transition-transform duration-200 ease-in-out z-50`;

  return (
    <>
      <aside className={sidebarClasses}>
        <div className="h-16 max-w-s flex items-center justify-between px-4 border-b border-indigo-600">
          <h2 className="text-2xl font-semibold">
            <Link to={"/"}>TaskPop</Link>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-indigo-600 md:hidden"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.to} className="px-4 py-2">
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-indigo-800 text-white"
                        : "text-indigo-100 hover:bg-indigo-600"
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full border-t border-indigo-600">
          <div className="px-4 py-4">
            <NavLink
              to="/settings"
              onClick={onClose}
              className="flex items-center px-4 py-2 text-indigo-100 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <Settings size={20} className="mr-3" />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
