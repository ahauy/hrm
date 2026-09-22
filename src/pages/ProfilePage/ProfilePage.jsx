import { useAuth } from "@/hooks/useAuth";
import RoleBadge from "@/components/common/RoleBadge";
import { User, Mail, Phone, Building, Briefcase, ShieldCheck, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

export default function ProfilePage() {
  const { profile, isAdmin } = useAuth();

  const displayName = profile?.fullName || profile?.username || "Người dùng";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const details = [
    { icon: Mail, label: "Email", value: profile?.email || "Chưa cập nhật" },
    { icon: Phone, label: "Số điện thoại", value: profile?.phone || "Chưa cập nhật" },
    { icon: Building, label: "Phòng ban", value: profile?.department || "Chưa phân bổ" },
    { icon: Briefcase, label: "Vị trí công việc", value: profile?.position || "Nhân viên" },
    { icon: Calendar, label: "Mã nhân viên / Username", value: profile?.username || "-" },
    ...(isAdmin ? [] : [
      { icon: ShieldCheck, label: "Mức lương cơ bản", value: formatCurrency(profile?.baseSalary || 0) }
    ]),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-deep flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-xs text-steel mt-1">
          Thông tin chi tiết về tài khoản và hồ sơ nhân sự của bạn trong hệ thống HRM.
        </p>
      </div>

      {/* Main Info Card */}
      <div className="bg-canvas rounded-2xl border border-hairline-soft shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-surface-soft border-b border-hairline-soft" />

        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-2xl ring-4 ring-canvas shadow-md">
              {initials}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-ink-deep">{displayName}</h2>
                <RoleBadge role={profile?.role} size="sm" />
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-success/10 text-success border border-success/20">
                  Hoạt động
                </span>
              </div>
              <p className="text-xs text-steel">
                {profile?.position || "Nhân sự"} • {profile?.department || "Nội bộ"}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-hairline-soft">
            {details.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-soft/60 border border-hairline-soft"
              >
                <div className="w-8 h-8 rounded-lg bg-canvas text-steel flex items-center justify-center border border-hairline shadow-2xs shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-steel">{item.label}</p>
                  <p className="text-xs font-semibold text-ink-deep truncate mt-0.5">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
