import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Save, ArrowLeft } from "lucide-react";
import {
  getTask,
  createTask,
  updateTask,
  getProjects,
  getTeamMembers,
} from "../../api";
import { Project, TeamMember, TaskStatus } from "../../types";
import Button from "../../components/Button";

type TaskFormInputs = {
  title: string;
  description: string;
  deadline: string;
  project: string;
  assignedMembers: string[];
  status: TaskStatus;
};

const TaskForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormInputs>({
    defaultValues: {
      status: "to-do",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch projects and team members
        const [projectsResponse, membersResponse] = await Promise.all([
          getProjects(1, 100),
          getTeamMembers(1, 100),
        ]);

        setProjects(projectsResponse.data);
        setTeamMembers(membersResponse.data);

        // If editing, fetch task details
        if (isEditMode) {
          const taskData = await getTask(id);

          // Format the date for the input
          const deadlineDate = new Date(taskData.deadline);
          const formattedDate = deadlineDate.toISOString().split("T")[0];

          reset({
            title: taskData.title,
            description: taskData.description,
            deadline: formattedDate,
            project:
              typeof taskData.project === "string"
                ? taskData.project
                : (taskData.project as Project)._id,
            assignedMembers: Array.isArray(taskData.assignedMembers)
              ? taskData.assignedMembers.map((member) =>
                  typeof member === "string" ? member : (member._id as string)
                )
              : [],
            status: taskData.status,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, reset]);

  const onSubmit = async (data: TaskFormInputs) => {
    try {
      setIsSaving(true);
      if (isEditMode) {
        await updateTask(id, data);
      } else {
        await createTask(data);
      }
      navigate("/tasks");
    } catch (error: any) {
      console.error("Error saving task:", error);

      if (
        error.response?.data?.message?.toLowerCase().includes("already exists")
      ) {
        toast.error("A task with this title already exists.");
      } else {
        toast.error("Failed to save the task. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate("/tasks")}
          className="mr-4 p-2 rounded-full dark:text-gray-200 hover:bg-gray-100 transition-all dark:hover:bg-gray-700"
          title="Back to Projects"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Task" : "Add Task"}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                {...register("title", { required: "Task title is required" })}
                className={`dark:text-white mt-1 p-2 block w-full rounded-md shadow-sm border outline-none transition-all duration-200 ${
                  errors.title
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "dark:bg-white/5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                {...register("description", {
                  required: "Description is required",
                })}
                className={`dark:text-white mt-1 p-2 block w-full rounded-md shadow-sm border outline-none transition-all duration-200 ${
                  errors.description
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "dark:bg-white/5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="project"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  id="project"
                  {...register("project", { required: "Project is required" })}
                  className={`dark:text-white mt-1 p-2 block w-full rounded-md shadow-sm border outline-none transition-all duration-200 ${
                    errors.project
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "dark:bg-gray-700/90 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                >
                  <option value="" disabled selected hidden>
                    Select a project
                  </option>
                  {projects.map((project) => (
                    <option
                      key={project._id}
                      value={project._id}
                      className="dark:bg-white/5"
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.project && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.project.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="deadline"
                  {...register("deadline", {
                    required: "Deadline is required",
                  })}
                  className={`dark:text-white mt-1 p-2 block w-full rounded-md shadow-sm border outline-none transition-all duration-200 ${
                    errors.deadline
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "dark:bg-white/5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.deadline.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="assignedMembers"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Assigned Members <span className="text-red-500">*</span>
              </label>
              <select
                id="assignedMembers"
                multiple
                {...register("assignedMembers", {
                  required: "At least one assigned member is required",
                })}
                className={`dark:text-white mt-1 p-2 block w-full rounded-md shadow-sm border outline-none transition-all duration-200 ${
                  errors.assignedMembers
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "dark:bg-white/5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                size={5}
              >
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.designation})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Hold Ctrl (or Cmd on Mac) to select multiple team members
              </p>
              {errors.assignedMembers && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.assignedMembers.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                {...register("status", { required: "Status is required" })}
                className={`dark:text-white mt-1 p-2 block w-full rounded-md shadow-sm border outline-none transition-all duration-200 ${
                  errors.status
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "dark:bg-gray-700/90 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              >
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/tasks")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              icon={<Save size={16} />}
            >
              {isEditMode ? "Update" : "Save"}
            </Button>
            <ToastContainer />
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
