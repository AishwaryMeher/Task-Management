import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { getTeamMembers, deleteTeamMember } from "../../api";
import { TeamMember } from "../../types";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";

const TeamList = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTeamMembers = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await getTeamMembers(page, 10);
      setTeamMembers(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers(currentPage);
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
      await deleteTeamMember(confirmDelete);
      fetchTeamMembers(currentPage);
    } catch (error) {
      console.error("Error deleting team member:", error);
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredTeamMembers = teamMembers.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.designation.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-[400px]:flex-col justify-between items-center max-[400px]:items-start gap-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Team Members
        </h1>
        <Link to="/teams/new">
          <Button variant="primary" icon={<Plus size={16} />}>
            Add Team Member
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
              placeholder="Search team members..."
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredTeamMembers.length > 0 ? (
          <div className="overflow-x-auto scrollBar">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Designation
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
                {filteredTeamMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-gray-50 dark:hover:bg-black/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {member.designation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          title="Edit"
                          onClick={() => navigate(`/teams/${member._id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 transition-all duration-200"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() =>
                            handleDeleteClick(member._id as string)
                          }
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
            No team members found
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
              Are you sure you want to delete this team member? This action
              cannot be undone.
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

export default TeamList;
