/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getBookings, deleteBooking } from "../../api/bookings";
import DateRangeButton from "../../components/Calendar/DateRangeButton";
import { type DateRange } from "react-day-picker";
import RescheduleModal from "../../components/Booking/RescheduleModal";
import { Calendar, Search, RotateCcw, Trash2, Clock } from "lucide-react";

type Booking = {
  id: number;
  inviteeName: string;
  inviteeEmail: string;
  startTime: string;
  endTime: string;
  createdAt: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [rescheduleBookingItem, setRescheduleBookingItem] = useState<Booking | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);

  const [search, setSearch] = useState("");
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();

  const [page, setPage] = useState(1);
  const perPage = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBookings();
      const data = res.data.data || res.data;
      setBookings(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Gagal memuat booking. Refresh halaman.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!range) return;

    if (range.from) {
      const y = range.from.getFullYear();
      const m = String(range.from.getMonth() + 1).padStart(2, "0");
      const d = String(range.from.getDate()).padStart(2, "0");
      setStartFilter(`${y}-${m}-${d}`);
    }

    if (range.to) {
      const y = range.to.getFullYear();
      const m = String(range.to.getMonth() + 1).padStart(2, "0");
      const d = String(range.to.getDate()).padStart(2, "0");
      setEndFilter(`${y}-${m}-${d}`);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let result = [...bookings];

    if (search.trim() !== "") {
      result = result.filter(
        (b) =>
          b.inviteeName.toLowerCase().includes(search.toLowerCase()) ||
          b.inviteeEmail.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (startFilter) {
      result = result.filter((b) => b.startTime >= startFilter);
    }

    if (endFilter) {
      result = result.filter((b) => b.startTime <= endFilter + "T23:59:59");
    }

    setFiltered(result);
    setPage(1);
  }, [search, startFilter, endFilter, bookings]);

  const handleDelete = async (id: number) => {
    const confirmed = await Swal.fire({
      title: "Hapus booking?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmed.isConfirmed) return;

    setDeletingId(id);
    try {
      await deleteBooking(id);
      await Swal.fire({
        title: "Dihapus",
        text: "Booking berhasil dihapus.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
      await load();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Gagal menghapus booking.",
        icon: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenReschedule = (b: Booking) => {
    setRescheduleBookingItem(b);
    setShowReschedule(true);
  };

  const formatLocal = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      ` ${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  };

  const startIndex = (page - 1) * perPage;
  const paginated = filtered.slice(startIndex, startIndex + perPage);
  console.log(paginated)
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="w-full px-4 md:px-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Bookings Dashboard</h1>
              <p className="text-gray-600 text-xs md:text-sm">Manage and view all meeting bookings</p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 md:mb-4">Filter & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Search Input */}
            <div className="relative md:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                placeholder="Search name or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Date Range Picker */}
            <div className="md:col-span-2 lg:col-span-1">
              <DateRangeButton value={range} onChange={setRange} />
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setRange(undefined);
                setSearch("");
                setStartFilter("");
                setEndFilter("");
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors text-sm"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reset Filter</span>
              <span className="sm:hidden">Reset</span>
            </button>

            {/* Stats */}
            <div className="flex items-center justify-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="ml-2 font-bold text-blue-600">{filtered.length}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-gray-500 text-sm">Loading bookings...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-gray-400" size={28} />
              </div>
              <p className="text-gray-500 font-medium">No bookings found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                        No
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                        Created
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginated.map((b, i) => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                          {startIndex + i + 1}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{b.inviteeName}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{b.inviteeEmail}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-xs text-gray-900">{formatLocal(b.startTime)}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-xs text-gray-900">{formatLocal(b.endTime)}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap hidden xl:table-cell">
                          <div className="text-xs text-gray-600">{formatLocal(b.createdAt)}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleOpenReschedule(b)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 font-medium transition-colors text-xs"
                              title="Reschedule"
                            >
                              <Clock size={13} />
                              <span className="hidden xl:inline">Reschedule</span>
                            </button>

                            <button
                              onClick={() => handleDelete(b.id)}
                              disabled={deletingId === b.id}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white font-medium transition-colors text-xs ${
                                deletingId === b.id
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-red-600 hover:bg-red-700"
                              }`}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                              <span className="hidden xl:inline">{deletingId === b.id ? "Deleting..." : "Cancel"}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {paginated.map((b, i) => (
                  <div key={b.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">#{startIndex + i + 1}</span>
                          <span className="text-sm font-semibold text-gray-900">{b.inviteeName}</span>
                        </div>
                        <div className="text-xs text-gray-600">{b.inviteeEmail}</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-600">Start:</span>
                        <span className="text-gray-900 font-medium">{formatLocal(b.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-600">End:</span>
                        <span className="text-gray-900 font-medium">{formatLocal(b.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-600">Created:</span>
                        <span className="text-gray-900">{formatLocal(b.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenReschedule(b)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 font-medium transition-colors text-sm"
                      >
                        <Clock size={14} />
                        Reschedule
                      </button>

                      <button
                        onClick={() => handleDelete(b.id)}
                        disabled={deletingId === b.id}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white font-medium transition-colors text-sm ${
                          deletingId === b.id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        <Trash2 size={14} />
                        {deletingId === b.id ? "Deleting..." : "Cancel"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-4 md:px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  <span className="text-xs md:text-sm text-gray-700">
                    Page <span className="font-semibold">{page}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        open={showReschedule}
        onClose={() => setShowReschedule(false)}
        booking={rescheduleBookingItem}
        onDone={() => load()}
      />
    </div>
  );
}