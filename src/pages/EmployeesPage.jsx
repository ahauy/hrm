import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "../stores/useAuthStore.js";
import NotAuthorPage from "./NotAuthorPage.jsx";
import TableEmployees from "../components/table/TableEmployees.jsx";
import EmployeeFormModal from "../components/modal/EmployeeFormModal.jsx";
import DeleteEmployeeModal from "../components/modal/DeleteEmployeeModal.jsx";
import { employeeServices } from "../services/employeeServices.js";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Shield,
  Building,
  UserCheck,
  X,
  Filter,
} from "lucide-react";
import { cn } from "../utils/cn.js";

const PAGE_SIZE = 8;

export default function EmployeesPage() {
  const profile = useAuthStore((state) => state.profile);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const role = profile?.role?.trim()?.toLowerCase() || "";
  const isAdmin = role.includes("admin");

  // Dữ liệu danh sách nhân viên
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bộ lọc & Tìm kiếm & Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all"); // 'all' | 'admin' | 'employee'
  const [currentPage, setCurrentPage] = useState(1);

  // Trạng thái modal
  const [formModal, setFormModal] = useState({
    isOpen: false,
    employee: null, // null: Thêm mới | object: Chỉnh sửa
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

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEmployees = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredEmployees.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredEmployees, safeCurrentPage]);

  // Kiểm tra quyền truy cập: Nếu không phải Admin, hiển thị NotAuthorPage
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

      {/* 2. Dải Thẻ Thống Kê Tương Tác */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Tổng nhân sự */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelectedRole("all");
            setSelectedDepartment("all");
            setCurrentPage(1);
          }}
          className={cn(
            "p-4 rounded-2xl bg-canvas border transition-all cursor-pointer shadow-2xs hover:shadow-xs",
            selectedRole === "all" && selectedDepartment === "all"
              ? "border-primary ring-2 ring-primary/10 bg-primary/[0.02]"
              : "border-hairline-soft hover:border-hairline"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-steel uppercase tracking-wider">
              Tổng số nhân sự
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface-soft text-slate flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink-deep font-mono tabular-nums">
              {stats.total}
            </span>
            <span className="text-xs text-stone">thành viên</span>
          </div>
        </div>

        {/* Quản trị viên */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelectedRole("admin");
            setCurrentPage(1);
          }}
          className={cn(
            "p-4 rounded-2xl bg-canvas border transition-all cursor-pointer shadow-2xs hover:shadow-xs",
            selectedRole === "admin"
              ? "border-primary ring-2 ring-primary/20 bg-primary/[0.04]"
              : "border-hairline-soft hover:border-hairline"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Quản trị viên
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink-deep font-mono tabular-nums">
              {stats.adminCount}
            </span>
            <span className="text-xs text-primary font-medium">toàn quyền</span>
          </div>
        </div>

        {/* Nhân viên thường */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelectedRole("employee");
            setCurrentPage(1);
          }}
          className={cn(
            "p-4 rounded-2xl bg-canvas border transition-all cursor-pointer shadow-2xs hover:shadow-xs",
            selectedRole === "employee"
              ? "border-slate ring-2 ring-slate/20 bg-slate/[0.04]"
              : "border-hairline-soft hover:border-hairline"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-steel uppercase tracking-wider">
              Nhân viên
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface-soft text-slate flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink-deep font-mono tabular-nums">
              {stats.employeeCount}
            </span>
            <span className="text-xs text-steel font-medium">tiêu chuẩn</span>
          </div>
        </div>

        {/* Số phòng ban */}
        <div className="p-4 rounded-2xl bg-canvas border border-hairline-soft shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-steel uppercase tracking-wider">
              Phòng ban hoạt động
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface-soft text-slate flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink-deep font-mono tabular-nums">
              {stats.departmentsCount}
            </span>
            <span className="text-xs text-stone">phòng ban</span>
          </div>
        </div>
      </div>

      {/* 3. Thanh Tìm Kiếm & Bộ Lọc Đa Chiều */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        {/* Tìm kiếm đa trường */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo họ tên, username, email, phòng ban..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-hairline-soft bg-canvas text-xs text-ink placeholder:text-stone focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-stone hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bộ lọc phòng ban và vai trò */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Lọc phòng ban */}
          <div className="flex items-center gap-1.5 bg-canvas border border-hairline-soft rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-steel" />
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-medium text-ink focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Tất cả phòng ban</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc vai trò */}
          <div className="flex items-center gap-1 p-1 bg-canvas border border-hairline-soft rounded-xl shadow-2xs">
            {[
              { id: "all", label: "Tất cả" },
              { id: "admin", label: "Admin" },
              { id: "employee", label: "Nhân viên" },
            ].map((tab) => {
              const isActive = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(tab.id);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-white shadow-2xs"
                      : "text-slate hover:text-ink hover:bg-surface-soft"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bảng Danh Sách Nhân Viên */}
      <TableEmployees
        employees={paginatedEmployees}
        isLoading={isLoading}
        currentProfile={profile}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        emptyText={
          searchTerm || selectedDepartment !== "all" || selectedRole !== "all"
            ? "Không tìm thấy nhân viên nào phù hợp với bộ lọc hiện tại"
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
          currentPage: safeCurrentPage,
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
        isSelf={
          Boolean(
            deleteModal.employee &&
              ((profile?.id && deleteModal.employee.id === profile.id) ||
                (profile?.username &&
                  deleteModal.employee.username === profile.username))
          )
        }
      />
    </div>
  );
}
