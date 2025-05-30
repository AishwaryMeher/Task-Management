import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Save, ArrowLeft } from "lucide-react";
import { getTeamMember, createTeamMember, updateTeamMember } from "../../api";
import Button from "../../components/Button";

type TeamFormInputs = {
  name: string;
  email: string;
  designation: string;
};

const TeamForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeamFormInputs>();

  useEffect(() => {
    const fetchTeamMember = async () => {
      if (!isEditMode) return;

      try {
        setIsLoading(true);
        const data = await getTeamMember(id);
        reset({
          name: data.name,
          email: data.email,
          designation: data.designation,
        });
      } catch (error) {
        console.error("Error fetching team member:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMember();
  }, [id, isEditMode, reset]);

  const onSubmit = async (data: TeamFormInputs) => {
    try {
      setIsSaving(true);
      if (isEditMode) {
        await updateTeamMember(id, data);
      } else {
        await createTeamMember(data);
      }
      navigate("/teams");
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("Team member already exists.");
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
          onClick={() => navigate("/teams")}
          className="mr-4 p-2 rounded-full dark:text-gray-200 hover:bg-gray-100 transition-all dark:hover:bg-gray-700"
          title="Back to Projects"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Team Member" : "Add Team Member"}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: "Name is required" })}
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
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Please enter a valid email address",
                  },
                })}
                className={`dark:text-white mt-1 p-2 block w-full rounded-md shadow-sm border outline-none transition-all duration-200 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "dark:bg-white/5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="designation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="designation"
                {...register("designation", {
                  required: "Designation is required",
                })}
                className={`dark:text-white mt-1 p-2 block w-full rounded-md shadow-sm border outline-none transition-all duration-200 ${
                  errors.designation
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "dark:bg-white/5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {errors.designation && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.designation.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/teams")}
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

export default TeamForm;
