import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import NotAuthorPage from "@/pages/NotAuthorPage";
import TableEmployees from "./components/TableEmployees";
import EmployeeFormModal from "./dialogs/EmployeeFormModal";
import DeleteEmployeeModal from "./dialogs/DeleteEmployeeModal";
import StatCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import { employeeServices } from "./services/employeeServices";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  RefreshCw,
  Shield,
  Building,
  UserCheck,
  Filter,
} from "lucide-react";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 8;

export default function EmployeesPage() {
  const { profile, isAuthLoading, isAdmin } = useAuth();

  // Dữ liệu danh sách nhân viên
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bộ lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all"); // 'all' | 'admin' | 'employee'

  // Trạng thái modal
  const [formModal, setFormModal] = useState({
    isOpen: false,
    employee: null,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employee: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Tải danh sách nhân viên từ API
  const fetchEmployees = useCallback(async () => {
    try {
      const data = await employeeServices.getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhân viên:", error);
      toast.error("Không thể tải danh sách nhân viên từ máy chủ");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (profile && isAdmin) {
        await fetchEmployees();
      } else if (profile) {
        setIsLoading(false);
      }
    };
    loadData();
  }, [profile, isAdmin, fetchEmployees]);

  // Làm mới dữ liệu
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEmployees();
    toast.success("Đã làm mới danh sách nhân viên");
  };

  // Mở modal Thêm mới nhân viên
  const handleOpenCreateModal = () => {
    setFormModal({
      isOpen: true,
      employee: null,
    });
  };

  // Mở modal Chỉnh sửa nhân viên
  const handleOpenEditModal = (emp) => {
    setFormModal({
      isOpen: true,
      employee: emp,
    });
  };

  // Mở modal Xác nhận Xóa
  const handleOpenDeleteModal = (emp) => {
    setDeleteModal({
      isOpen: true,
      employee: emp,
    });
  };

  // Thực hiện Xóa nhân viên qua API
  const handleConfirmDelete = async () => {
    if (!deleteModal.employee) return;

    const empId = deleteModal.employee.id;
    const empName = deleteModal.employee.fullName || deleteModal.employee.username;

    try {
      setIsDeleting(true);
      await employeeServices.deleteEmployee(empId);
      toast.success(`Đã xóa nhân viên "${empName}" thành công!`);
      setDeleteModal({ isOpen: false, employee: null });
      await fetchEmployees();
    } catch (error) {
      console.error("Lỗi khi xóa nhân viên:", error);
      const serverMsg =
        error.response?.data?.message || "Không thể xóa nhân viên này";
      toast.error(serverMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Danh sách các phòng ban duy nhất để lọc
  const departmentOptions = useMemo(() => {
    const set = new Set();
    employees.forEach((emp) => {
      if (emp.department && emp.department.trim()) {
        set.add(emp.department.trim());
      }
    });
    return Array.from(set).sort();
  }, [employees]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = employees.length;
    let adminCount = 0;
    let employeeCount = 0;
    const deptSet = new Set();

    employees.forEach((emp) => {
      const r = (emp.role || "").toLowerCase();
      if (r.includes("admin")) adminCount += 1;
      else employeeCount += 1;

      if (emp.department && emp.department.trim()) {
        deptSet.add(emp.department.trim());
      }
    });

    return {
      total,
      adminCount,
      employeeCount,
      departmentsCount: deptSet.size,
    };
  }, [employees]);

  // Lọc dữ liệu theo điều kiện tìm kiếm và bộ lọc
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Lọc theo vai trò
      if (selectedRole !== "all") {
        const r = (emp.role || "").toLowerCase();
        if (selectedRole === "admin" && !r.includes("admin")) return false;
        if (selectedRole === "employee" && r.includes("admin")) return false;
      }

      // 2. Lọc theo phòng ban
      if (selectedDepartment !== "all") {
        if ((emp.department || "").trim() !== selectedDepartment) return false;
      }

      // 3. Tìm kiếm theo từ khóa
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      const nameMatch = (emp.fullName || "").toLowerCase().includes(term);
      const usernameMatch = (emp.username || "").toLowerCase().includes(term);
      const emailMatch = (emp.email || "").toLowerCase().includes(term);
      const phoneMatch = (emp.phone || "").toLowerCase().includes(term);
      const positionMatch = (emp.position || "").toLowerCase().includes(term);
      const deptMatch = (emp.department || "").toLowerCase().includes(term);
      const idMatch = String(emp.id).includes(term);

      return (
        nameMatch ||
        usernameMatch ||
        emailMatch ||
        phoneMatch ||
        positionMatch ||
        deptMatch ||
        idMatch
      );
    });
  }, [employees, selectedRole, selectedDepartment, searchTerm]);

  // Quản lý phân trang qua custom hook
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedEmployees,
  } = usePagination(filteredEmployees, PAGE_SIZE);

  // Kiểm tra quyền truy cập
  if (!isAuthLoading && !isAdmin) {
    return <NotAuthorPage />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Trang & Nút Hành Động */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-deep flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            <span>Quản trị Hồ sơ Nhân sự</span>
          </h1>
          <p className="text-xs sm:text-sm text-steel mt-1">
            Quản lý tài khoản, thông tin cá nhân, phân quyền vai trò và phòng ban nhân viên
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-hairline bg-canvas hover:bg-surface-soft text-ink text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw
              className={cn(
                "w-3.5 h-3.5 text-steel",
                isRefreshing && "animate-spin text-primary"
              )}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm nhân viên mới</span>
          </button>
        </div>
      </div>

      {/* 2. Dải Thẻ Thống Kê Tương Tác dùng chung StatCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Tổng số nhân sự"
          value={stats.total}
          subtext="Tất cả thành viên trong tổ chức"
          icon={<Users className="w-4 h-4" />}
          iconBg="bg-surface-soft text-slate border border-hairline-soft"
          isActive={selectedRole === "all" && selectedDepartment === "all"}
          onClick={() => {
            setSelectedRole("all");
            setSelectedDepartment("all");
            setCurrentPage(1);
          }}
        />

        <StatCard
          title="Quản trị viên"
          value={stats.adminCount}
          subtext="Toàn quyền quản trị hệ thống"
          icon={<Shield className="w-4 h-4 text-primary" />}
          iconBg="bg-primary/10 text-primary border border-primary/20"
          isActive={selectedRole === "admin"}
          onClick={() => {
            setSelectedRole("admin");
            setCurrentPage(1);
          }}
        />

        <StatCard
          title="Nhân viên"
          value={stats.employeeCount}
          subtext="Quyền thao tác tiêu chuẩn"
          icon={<UserCheck className="w-4 h-4 text-steel" />}
          iconBg="bg-surface-soft text-slate border border-hairline-soft"
          isActive={selectedRole === "employee"}
          onClick={() => {
            setSelectedRole("employee");
            setCurrentPage(1);
          }}
        />

        <StatCard
          title="Phòng ban hoạt động"
          value={stats.departmentsCount}
          subtext="Số đơn vị phòng ban hiện có"
          icon={<Building className="w-4 h-4 text-steel" />}
          iconBg="bg-surface-soft text-slate border border-hairline-soft"
        />
      </div>

      {/* 3. Thanh Tìm Kiếm & Bộ Lọc Đa Chiều */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        {/* Tìm kiếm đa trường dùng SearchInput */}
        <SearchInput
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Tìm theo họ tên, username, email, phòng ban..."
        />

        {/* Cụm bộ lọc Role & Phòng ban */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {/* Lọc theo Vai trò */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl border border-hairline bg-canvas text-xs font-medium text-ink focus:outline-none focus:border-primary transition-all cursor-pointer shadow-2xs appearance-none"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên ({stats.adminCount})</option>
              <option value="employee">Nhân viên ({stats.employeeCount})</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-stone absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Lọc theo Phòng ban */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl border border-hairline bg-canvas text-xs font-medium text-ink focus:outline-none focus:border-primary transition-all cursor-pointer shadow-2xs appearance-none"
            >
              <option value="all">Tất cả phòng ban</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <Building className="w-3.5 h-3.5 text-stone absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Nút Xóa bộ lọc nếu có lựa chọn khác mặc định */}
          {(searchTerm || selectedRole !== "all" || selectedDepartment !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedRole("all");
                setSelectedDepartment("all");
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-hairline bg-surface-soft hover:bg-surface text-xs font-medium text-steel hover:text-ink transition-colors cursor-pointer"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* 4. Bảng Dữ Liệu Nhân Viên */}
      <TableEmployees
        employees={paginatedEmployees}
        isLoading={isLoading}
        currentProfile={profile}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        emptyText={
          searchTerm || selectedDepartment !== "all" || selectedRole !== "all"
            ? "Không tìm thấy nhân viên nào phù hợp với điều kiện tìm kiếm."
            : "Chưa có nhân viên nào trong danh sách"
        }
        emptyAction={
          !searchTerm && selectedDepartment === "all" && selectedRole === "all" ? (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm nhân viên đầu tiên</span>
            </button>
          ) : undefined
        }
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredEmployees.length,
          onPageChange: (newPage) => setCurrentPage(newPage),
        }}
      />

      {/* 5. Modal Thêm / Chỉnh Sửa Nhân Viên */}
      <EmployeeFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, employee: null })}
        onSuccess={fetchEmployees}
        employee={formModal.employee}
      />

      {/* 6. Modal Xác Nhận Xóa Nhân Viên */}
      <DeleteEmployeeModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, employee: null })}
        employee={deleteModal.employee}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        isSelf={Boolean(
          deleteModal.employee &&
            ((profile?.id && deleteModal.employee.id === profile.id) ||
              (profile?.username &&
                deleteModal.employee.username === profile.username))
        )}
      />
    </div>
  );
}
