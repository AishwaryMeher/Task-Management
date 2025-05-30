import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Filter, Calendar } from "lucide-react";
import { format } from "date-fns";
import { getTasks, deleteTask, getProjects, getTeamMembers } from "../../api";
import { Task, Project, TeamMember, FilterParams } from "../../types";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10,
    project: "",
    member: "",
    status: undefined,
    search: "",
    startDate: "",
    endDate: "",
  });

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await getTasks({
        ...filters,
        page: currentPage,
      });
      setTasks(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilterData = async () => {
    try {
      const [projectsResponse, membersResponse] = await Promise.all([
        getProjects(1, 100),
        getTeamMembers(1, 100),
      ]);
      setProjects(projectsResponse.data);
      setTeamMembers(membersResponse.data);
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [currentPage, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      project: "",
      member: "",
      status: undefined,
      search: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deleteTask(confirmDelete);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setConfirmDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      "to-do": "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      done: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status}
      </span>
    );
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p._id === projectId);
    return project ? project.name : "Unknown Project";
  };

  const getTeamMemberNames = (memberIds: string[]) => {
    if (!memberIds.length) return "No members assigned";

    const members = memberIds.map((id) => {
      const member = teamMembers.find((m) => m._id === id);
      return member ? member.name : "Unknown";
    });

    if (members.length <= 2) {
      return members.join(", ");
    }

    return `${members[0]}, ${members[1]} +${members.length - 2} more`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-[400px]:flex-col justify-between items-center max-[400px]:items-start gap-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Tasks
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
            className="dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 "
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Link to="/tasks/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Add Task
            </Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Search
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="block p-2 w-full pl-10 sm:text-sm dark:text-white dark:bg-white/5 border border-gray-300 rounded-md outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Search by title or description"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="project"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Project
              </label>
              <select
                id="project"
                name="project"
                value={filters.project}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border dark:border-none dark:bg-gray-700 dark:text-white border-gray-300 outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-all duration-200"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="member"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Team Member
              </label>
              <select
                id="member"
                name="member"
                value={filters.member}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border dark:border-none dark:bg-gray-700 dark:text-white border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md outline-none transition-all duration-200"
              >
                <option value="">All Members</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status || ""}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border dark:border-none dark:bg-gray-700 dark:text-white border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md outline-none transition-all duration-200"
              >
                <option value="">All Statuses</option>
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Start Date
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="block p-2 w-full pl-10 sm:text-sm dark:bg-gray-700 dark:text-white border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                End Date
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="block p-2 w-full pl-10 sm:text-sm dark:bg-gray-700 dark:text-white border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="lg:col-span-2 flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="mt-1 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Project
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Assigned To
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Deadline
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="hover:bg-gray-50 dark:hover:bg-black/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {task.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-400">
                        {typeof task.project === "object"
                          ? task.project.name
                          : getProjectName(task.project)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {Array.isArray(task.assignedMembers) &&
                          (typeof task.assignedMembers[0] === "object"
                            ? task.assignedMembers
                                .map((m: any) => m.name)
                                .join(", ")
                            : getTeamMemberNames(
                                task.assignedMembers as string[]
                              ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(task.deadline), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          title="Edit"
                          onClick={() => navigate(`/tasks/${task._id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 transition-all duration-200"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDeleteClick(task._id as string)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-500 transition-all duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-300">
            No tasks found
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
