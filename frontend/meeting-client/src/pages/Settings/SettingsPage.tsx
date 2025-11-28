/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getSettings, updateSettings } from "../../api/settings";
import BlackoutDatePicker from "../../components/Calendar/BlackoutDatePicker";
import { Settings as SettingsIcon, Clock, Globe, Calendar, Bell, Save, RotateCcw } from "lucide-react";
import { timezones } from "../../constants/timezones";

type Settings = {
  id?: number;
  timezone: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  meetingDuration: number;
  bufferBefore: number;
  bufferAfter: number;
  minimumNotice: number;
  blackoutDates: string[];
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    meetingDuration: 30,
    bufferBefore: 10,
    bufferAfter: 10,
    minimumNotice: 1,
    blackoutDates: [],
  });

  const validateSettings = () => {
    const {
      workingHoursStart,
      workingHoursEnd,
      meetingDuration,
      bufferBefore,
      bufferAfter,
      minimumNotice,
      blackoutDates,
    } = settings;

    const isValidTime = (t: string) => /^\d{2}:\d{2}$/.test(t);
    if (!isValidTime(workingHoursStart) || !isValidTime(workingHoursEnd)) {
      return "Working hours must be in HH:mm format.";
    }

    const [sh, sm] = workingHoursStart.split(":").map(Number);
    const [eh, em] = workingHoursEnd.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    if (startMin >= endMin) {
      return "Start time must be earlier than end time.";
    }

    const diff = endMin - startMin;
    if (meetingDuration <= 0) {
      return "Meeting duration must be greater than 0.";
    }
    if (meetingDuration > diff) {
      return "Meeting duration cannot exceed total working hours.";
    }

    if (bufferBefore < 0 || bufferAfter < 0) {
      return "Buffer time cannot be negative.";
    }

    if (minimumNotice < 0) {
      return "Minimum notice must be 0 or greater.";
    }

    const now = new Date();
    for (const d of blackoutDates) {
      const dateObj = new Date(d);
      if (dateObj.toString() === "Invalid Date") {
        return "Blackout date format invalid.";
      }
      if (dateObj < now) {
        return "Blackout dates cannot include past dates.";
      }
    }

    return null;
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getSettings();
        const data = res.data.data;
        if (data) {
          setSettings({
            timezone: data.timezone || settings.timezone,
            workingHoursStart: data.workingHoursStart || "09:00",
            workingHoursEnd: data.workingHoursEnd || "17:00",
            meetingDuration: data.meetingDuration ?? 30,
            bufferBefore: data.bufferBefore ?? 10,
            bufferAfter: data.bufferAfter ?? 10,
            minimumNotice: data.minimumNotice ?? 1,
            blackoutDates: Array.isArray(data.blackoutDates) ? data.blackoutDates : [],
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Gagal memuat settings", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    const error = validateSettings();
    if (error) {
      Swal.fire("Validation Error", error, "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        timezone: settings.timezone,
        workingHoursStart: settings.workingHoursStart,
        workingHoursEnd: settings.workingHoursEnd,
        meetingDuration: Number(settings.meetingDuration),
        bufferBefore: Number(settings.bufferBefore),
        bufferAfter: Number(settings.bufferAfter),
        minimumNotice: Number(settings.minimumNotice),
        blackoutDates: settings.blackoutDates,
      };

      const res = await updateSettings(payload);

      Swal.fire("Saved", "Settings berhasil disimpan", "success");

      if (res.data.data) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal menyimpan settings";
      Swal.fire("Error", msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReload = () => {
    setLoading(true);
    getSettings()
      .then((r) => {
        const d = r.data.data;
        if (d) {
          setSettings({
            timezone: d.timezone || settings.timezone,
            workingHoursStart: d.workingHoursStart || "09:00",
            workingHoursEnd: d.workingHoursEnd || "17:00",
            meetingDuration: d.meetingDuration ?? 30,
            bufferBefore: d.bufferBefore ?? 10,
            bufferAfter: d.bufferAfter ?? 10,
            minimumNotice: d.minimumNotice ?? 1,
            blackoutDates: Array.isArray(d.blackoutDates) ? d.blackoutDates : [],
          });
        }
      })
      .catch(() => {
        Swal.fire("Error", "Gagal reload settings", "error");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <SettingsIcon className="text-blue-600" size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-left">Organizer Settings</h1>
              <p className="text-gray-600 text-xs md:text-sm">Configure your meeting preferences and availability</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-gray-500 text-sm">Loading settings...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timezone Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={18} className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Timezone</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Default timezone is automatically detected from your browser
                </p>
              </div>
            </div>

            {/* Working Hours Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Working Hours</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={settings.workingHoursStart}
                    onChange={(e) => setSettings({ ...settings, workingHoursStart: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={settings.workingHoursEnd}
                    onChange={(e) => setSettings({ ...settings, workingHoursEnd: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Meeting Configuration Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Meeting Configuration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration <span className="text-gray-500">(minutes)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={settings.meetingDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        meetingDuration: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default meeting length</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buffer Before <span className="text-gray-500">(min)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.bufferBefore}
                    onChange={(e) => setSettings({ ...settings, bufferBefore: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Time before meeting</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buffer After <span className="text-gray-500">(min)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.bufferAfter}
                    onChange={(e) => setSettings({ ...settings, bufferAfter: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Time after meeting</p>
                </div>
              </div>
            </div>

            {/* Minimum Notice Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Minimum Notice</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Notice Required <span className="text-gray-500">(hours)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.minimumNotice}
                  onChange={(e) => setSettings({ ...settings, minimumNotice: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Number of hours required before a booking can be scheduled
                </p>
              </div>
            </div>

            {/* Blackout Dates Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Blackout Dates</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unavailable Dates
                </label>
                <BlackoutDatePicker
                  value={settings.blackoutDates}
                  onChange={(arr) => setSettings({ ...settings, blackoutDates: arr })}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Select dates when you are not available for meetings
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    saving
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Settings
                    </>
                  )}
                </button>

                <button
                  onClick={handleReload}
                  disabled={loading || saving}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={18} />
                  Reload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}