import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, FolderKanban, CheckSquare, Clock } from "lucide-react";
import { getTeamMembers, getProjects, getTasks } from "../api";
import { Task } from "../types";

const Dashboard = () => {
  const [teamCount, setTeamCount] = useState<number>(0);
  const [projectCount, setProjectCount] = useState<number>(0);
  const [taskCounts, setTaskCounts] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    cancelled: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [teamResponse, projectResponse, taskResponse] = await Promise.all(
          [getTeamMembers(1, 1), getProjects(1, 1), getTasks({ limit: 5 })]
        );

        setTeamCount(teamResponse.totalCount);
        setProjectCount(projectResponse.totalCount);

        const todoCount = taskResponse.data.filter(
          (task) => task.status === "to-do"
        ).length;
        const inProgressCount = taskResponse.data.filter(
          (task) => task.status === "in-progress"
        ).length;
        const doneCount = taskResponse.data.filter(
          (task) => task.status === "done"
        ).length;
        const cancelledCount = taskResponse.data.filter(
          (task) => task.status === "cancelled"
        ).length;

        setTaskCounts({
          total: taskResponse.totalCount,
          todo: todoCount,
          inProgress: inProgressCount,
          done: doneCount,
          cancelled: cancelledCount,
        });

        setRecentTasks(taskResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {title}
        </h3>
        <p className="text-2xl dark:text-white font-semibold">{value}</p>
      </div>
    </div>
  );

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex max-[400px]:flex-col justify-between items-center max-[400px]:items-start gap-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex space-x-2">
          <Link
            to="/tasks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            New Task
          </Link>
          <Link
            to="/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
          >
            New Project
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Team Members"
          value={teamCount}
          icon={<Users size={24} className="text-white" />}
          color="bg-indigo-600"
        />
        <StatCard
          title="Projects"
          value={projectCount}
          icon={<FolderKanban size={24} className="text-white" />}
          color="bg-teal-600"
        />
        <StatCard
          title="Total Tasks"
          value={taskCounts.total}
          icon={<CheckSquare size={24} className="text-white" />}
          color="bg-amber-500"
        />
        <StatCard
          title="In Progress"
          value={taskCounts.inProgress}
          icon={<Clock size={24} className="text-white" />}
          color="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Tasks
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task._id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        <Link
                          to={`/tasks/${task._id}/edit`}
                          className="dark:text-white hover:text-indigo-600 dark:hover:text-indigo-500 transition-all duration-200"
                        >
                          {task.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span className="mr-3 dark:text-gray-400">
                          Project:{" "}
                          <span className="text-gray-900 dark:text-white">
                            {typeof task.project === "object"
                              ? task.project.name
                              : "Unknown"}
                          </span>
                        </span>
                        <span className="dark:text-gray-400">
                          Due:{" "}
                          <span className="text-gray-900 dark:text-white">
                            {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div>{getStatusBadge(task.status)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No tasks found
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <Link
              to="/tasks"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-all duration-200"
            >
              View all tasks
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Task Summary
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    To Do
                  </span>
                  <span className="text-sm text-gray-500">
                    {taskCounts.todo}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(taskCounts.todo / taskCounts.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    In Progress
                  </span>
                  <span className="text-sm text-gray-500">
                    {taskCounts.inProgress}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (taskCounts.inProgress / taskCounts.total) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Done
                  </span>
                  <span className="text-sm text-gray-500">
                    {taskCounts.done}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(taskCounts.done / taskCounts.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cancelled
                  </span>
                  <span className="text-sm text-gray-500">
                    {taskCounts.cancelled}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (taskCounts.cancelled / taskCounts.total) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
