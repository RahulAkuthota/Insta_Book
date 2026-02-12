import { useState } from "react";
import { toast } from "react-hot-toast";
import { createEvent } from "../../api/events.api";
import { useNavigate } from "react-router-dom";

const CreateEvent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    otherCategory: "",
    date: "",
    startTime: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormInvalid =
    !form.title.trim() ||
    !form.description.trim() ||
    !form.category ||
    (form.category === "Other" && !form.otherCategory.trim()) ||
    !form.date ||
    !form.startTime ||
    !form.location.trim();

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (isFormInvalid) {
    toast.error("All fields are mandatory");
    return;
  }

  try {
    setLoading(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category:
        form.category === "Other"
          ? form.otherCategory.trim()
          : form.category,
      date: form.date,
      startTime: form.startTime, // 24h format OK
      location: form.location.trim(),
    };

    const res = await createEvent(payload);

    toast.success(res?.data?.message || "Event created successfully 🎉");

    // slight delay so toast is visible
    setTimeout(() => {
      navigate("/organizer/events");
    }, 800);

  } catch (err) {
    console.error(err);
    toast.error(
      err.response?.data?.message || "Failed to create event"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-indigo-100/60 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Event
          </h1>
          <p className="mt-1 text-gray-600">
            <span className="text-red-500">*</span> All fields are mandatory
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-xl space-y-6"
        >
          {/* TITLE */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="">Select category</option>
              <option>College Event</option>
              <option>Music</option>
              <option>Workshop</option>
              <option>Conference</option>
              <option>Sports</option>
              <option>Other</option>
            </select>
          </div>

          {form.category === "Other" && (
            <input
              name="otherCategory"
              placeholder="Specify category"
              value={form.otherCategory}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          )}

          {/* DATE & TIME */}
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="rounded-lg border px-3 py-2"
            />
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="rounded-lg border px-3 py-2"
            />
          </div>

          {/* LOCATION */}
          <input
            name="location"
            placeholder="Event Location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
          />

          {/* ACTION */}
          <div className="flex justify-end">
            <button
              disabled={loading || isFormInvalid}
              className={`rounded-lg px-6 py-2 font-semibold text-white ${
                loading || isFormInvalid
                  ? "bg-indigo-400"
                  : "bg-gradient-to-r from-indigo-600 to-cyan-600"
              }`}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
