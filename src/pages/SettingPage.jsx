import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { settingsServices } from "../services/settingsServices.js";
import { SHIFT_CONFIG } from "../utils/attendanceCalculator.js";
import { Settings, Save, Clock, Shield, CheckCircle2, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingPage() {
  const { isAdmin } = useAuth();
  const [standardWorkDays, setStandardWorkDays] = useState(22);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await settingsServices.getSettings();
      if (data && data.standardWorkDays) {
        setStandardWorkDays(Number(data.standardWorkDays) || 22);
      }
    } catch {
      // Fallback
      setStandardWorkDays(22);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (isMounted) await loadSettings();
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [loadSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Chỉ Quản trị viên mới có quyền cập nhật cài đặt hệ thống");
      return;
    }
    const val = Number(standardWorkDays);
    if (isNaN(val) || val < 1 || val > 31) {
      toast.error("Số ngày công chuẩn phải từ 1 đến 31");
      return;
    }
    try {
      setIsSaving(true);
      await settingsServices.updateSettings({ standardWorkDays: val });
      toast.success("Lưu cấu hình hệ thống thành công!");
    } catch {
      toast.error("Không thể lưu cấu hình lên máy chủ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-deep flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Cài đặt hệ thống
        </h1>
        <p className="text-xs text-steel mt-1">
          Quản lý các thông số vận hành mặc định của doanh nghiệp và quy chế tính công.
        </p>
      </div>

      {/* Form Cài Đặt Ngày Công Chuẩn */}
      <div className="bg-canvas rounded-2xl border border-hairline-soft shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink-deep">Quy định công chuẩn</h2>
              <p className="text-xs text-steel">
                Số ngày công làm việc tiêu chuẩn trong tháng dùng để tính lương
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-soft text-slate border border-hairline">
            Mặc định toàn công ty
          </span>
        </div>

        <form onSubmit={handleSave} className="pt-3 border-t border-hairline-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-deep block">
              Số ngày công chuẩn / tháng:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="31"
                disabled={!isAdmin || isLoading}
                value={standardWorkDays}
                onChange={(e) => setStandardWorkDays(e.target.value)}
                className="w-24 px-3 py-1.5 bg-surface-soft border border-hairline rounded-xl text-sm font-bold text-ink text-center outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
              />
              <span className="text-xs font-medium text-steel">ngày công</span>
            </div>
          </div>

          {isAdmin && (
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-deep text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Đang lưu..." : "Lưu cài đặt"}</span>
            </button>
          )}
        </form>
      </div>

      {/* Quy định ca làm việc tiêu chuẩn */}
      <div className="bg-canvas rounded-2xl border border-hairline-soft shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink-deep">Quy chuẩn ca làm việc & Chấm công</h2>
            <p className="text-xs text-steel">
              Quy tắc thời gian áp dụng chung cho toàn bộ nhân sự văn phòng
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-hairline-soft">
          <div className="p-3 rounded-xl bg-surface-soft/60 border border-hairline-soft">
            <span className="text-[11px] font-medium text-steel block">Giờ vào ca</span>
            <span className="text-sm font-bold text-ink-deep mt-1 block">
              {String(SHIFT_CONFIG.START_HOUR).padStart(2, "0")}:{String(SHIFT_CONFIG.START_MINUTE).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-success font-medium">Ân hạn: +{SHIFT_CONFIG.GRACE_MINUTES} phút</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-soft/60 border border-hairline-soft">
            <span className="text-[11px] font-medium text-steel block">Giờ tan ca</span>
            <span className="text-sm font-bold text-ink-deep mt-1 block">
              {String(SHIFT_CONFIG.END_HOUR).padStart(2, "0")}:{String(SHIFT_CONFIG.END_MINUTE).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-steel font-medium">Tan làm ca chiều</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-soft/60 border border-hairline-soft">
            <span className="text-[11px] font-medium text-steel block">Nghỉ trưa</span>
            <span className="text-sm font-bold text-ink-deep mt-1 block">
              {SHIFT_CONFIG.LUNCH_DURATION_MINUTES} phút
            </span>
            <span className="text-[10px] text-steel font-medium">
              {SHIFT_CONFIG.LUNCH_START_HOUR}:00 - {SHIFT_CONFIG.LUNCH_END_HOUR}:{SHIFT_CONFIG.LUNCH_END_MINUTE}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-soft/60 border border-hairline-soft">
            <span className="text-[11px] font-medium text-steel block">Chuẩn ca làm việc</span>
            <span className="text-sm font-bold text-primary mt-1 block">
              {SHIFT_CONFIG.STANDARD_WORK_MINUTES / 60} tiếng / ngày
            </span>
            <span className="text-[10px] text-primary font-medium">Tương đương 1.0 công</span>
          </div>
        </div>
      </div>

      {/* Thông tin hệ thống */}
      <div className="bg-canvas rounded-2xl border border-hairline-soft shadow-xs p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-ink-deep">HRM Platform v1.0</h3>
            <p className="text-[11px] text-steel">Hệ thống quản trị nhân sự & tiền lương đồng bộ</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>Hệ thống hoạt động ổn định</span>
        </div>
      </div>
    </div>
  );
}
