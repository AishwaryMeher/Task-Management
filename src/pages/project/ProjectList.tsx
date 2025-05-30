import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react";
import { getProjects, deleteProject } from "../../api";
import { Project } from "../../types";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProjects = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await getProjects(page, 10);
      setProjects(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deleteProject(confirmDelete);
      fetchProjects(currentPage);
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-[400px]:flex-col justify-between items-center max-[400px]:items-start gap-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Projects
        </h1>
        <Link to="/projects/new">
          <Button variant="primary" icon={<Plus size={16} />}>
            Add Project
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full p-2 pl-10 text-sm text-gray-900 dark:text-white outline-none border border-gray-300 rounded-lg bg-gray-50 dark:bg-white/5 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Search projects..."
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white dark:bg-gray-900/70 border dark:border-none border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <h5 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {project.name}
                  </h5>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                    <Users size={16} className="mr-1" />
                    <span>
                      {Array.isArray(project.teamMembers)
                        ? project.teamMembers.length
                        : 0}{" "}
                      team members
                    </span>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      title="Edit"
                      onClick={() => navigate(`/projects/${project._id}/edit`)}
                      className="p-2 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50 transition-all duration-200"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDeleteClick(project._id as string)}
                      className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50 transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-300">
            No projects found
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
              Are you sure you want to delete this project? This action cannot
              be undone and will also delete all tasks associated with this
              project.
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

export default ProjectList;
