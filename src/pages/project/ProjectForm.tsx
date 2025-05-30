import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Save, ArrowLeft } from "lucide-react";
import {
  getProjectByName,
  getProject,
  createProject,
  updateProject,
  getTeamMembers,
} from "../../api";
import { TeamMember } from "../../types";
import Button from "../../components/Button";

type ProjectFormInputs = {
  name: string;
  description: string;
  teamMembers: string[];
};

const ProjectForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormInputs>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch team members
        const teamResponse = await getTeamMembers(1, 100);
        setTeamMembers(teamResponse.data);

        // If editing, fetch project details
        if (isEditMode) {
          const projectData = await getProject(id);

          reset({
            name: projectData.name,
            description: projectData.description,
            teamMembers: Array.isArray(projectData.teamMembers)
              ? projectData.teamMembers.map((member) =>
                  typeof member === "string" ? member : (member._id as string)
                )
              : [],
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

  const onSubmit = async (data: ProjectFormInputs) => {
    try {
      setIsSaving(true);

      // 🔍 Check if project name already exists (case-insensitive)
      const existing = await getProjectByName(data.name.trim());

      if (!isEditMode && existing) {
        toast.error("Project with this name already exists.");
        return;
      }

      if (isEditMode && existing && existing._id !== id) {
        toast.error("Another project with this name already exists.");
        return;
      }

      if (isEditMode) {
        await updateProject(id, data);
      } else {
        await createProject(data);
      }

      navigate("/projects");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Something went wrong.");
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
          onClick={() => navigate("/projects")}
          className="mr-4 p-2 rounded-full dark:text-gray-200 hover:bg-gray-100 transition-all dark:hover:bg-gray-700"
          title="Back to Projects"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Project" : "Add Project"}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: "Project name is required" })}
                className={`dark:text-white mt-1 p-2 block w-full rounded-md shadow-sm border outline-none transition-all duration-200 ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "dark:bg-white/5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
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

            <div>
              <label
                htmlFor="teamMembers"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Team Members <span className="text-red-500">*</span>
              </label>
              <select
                id="teamMembers"
                multiple
                {...register("teamMembers", {
                  required: "At least one team member is required",
                })}
                className={`dark:text-white mt-1 p-2 block w-full rounded-md shadow-sm border outline-none transition-all duration-200 ${
                  errors.teamMembers
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
              {errors.teamMembers && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.teamMembers.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/projects")}
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

export default ProjectForm;
