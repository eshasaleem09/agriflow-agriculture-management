import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTask,
  updateTask,
  deleteTask,
  markTaskDone,
} from "../features/tasks/tasksSlice.js";

import {
  Plus,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pencil,
  Trash2,
  Sprout,
  AlertTriangle,
  X,
  ClipboardList,
} from "lucide-react";

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTaskStatus(task, today) {
  if (task.status === "Done") {
    return "Done";
  }

  if (task.dueDate < today) {
    return "Overdue";
  }

  return "Pending";
}

function Tasks() {
  const dispatch = useDispatch();

  const tasks = useSelector((state) => state.tasks);
  const crops = useSelector((state) => state.crops);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === "Admin";
  const today = getLocalDate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");

  const emptyForm = {
    title: "",
    cropId: "",
    dueDate: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  const taskCounts = useMemo(() => {
    return {
      total: tasks.length,

      pending: tasks.filter(
        (task) => getTaskStatus(task, today) === "Pending"
      ).length,

      overdue: tasks.filter(
        (task) => getTaskStatus(task, today) === "Overdue"
      ).length,

      done: tasks.filter(
        (task) => task.status === "Done"
      ).length,
    };
  }, [tasks, today]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const crop = crops.find(
          (item) => Number(item.id) === Number(task.cropId)
        );

        const taskStatus = getTaskStatus(task, today);

        const matchesSearch =
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          (crop?.name || "").toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "All" || taskStatus === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, crops, search, statusFilter, today]);

  function openAddModal() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      cropId: crops.length ? String(crops[0].id) : "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(task) {
    if (!isAdmin) return;

    setEditingId(task.id);

    setForm({
      title: task.title,
      cropId: String(task.cropId),
      dueDate: task.dueDate,
      notes: task.notes || "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (editingId !== null && !isAdmin) {
      setFormError("You do not have permission to edit tasks.");
      return;
    }

    const title = form.title.trim();
    const cropId = Number(form.cropId);
    const dueDate = form.dueDate;
    const notes = form.notes.trim();

    if (!title || !form.cropId || !dueDate) {
      setFormError("Please complete all required fields.");
      return;
    }

    const linkedCrop = crops.find(
      (crop) => Number(crop.id) === cropId
    );

    if (!linkedCrop) {
      setFormError("Please select a valid crop.");
      return;
    }

    const taskData = {
      title,
      cropId,
      dueDate,
      notes,
    };

    if (editingId !== null) {
      const existingTask = tasks.find(
        (task) => task.id === editingId
      );

      dispatch(
        updateTask({
          ...existingTask,
          ...taskData,
        })
      );
    } else {
      dispatch(
        addTask({
          id: Date.now(),
          ...taskData,
          status: "Pending",
          createdAt: new Date().toISOString(),
        })
      );
    }

    setModalOpen(false);
    setFormError("");
    setForm(emptyForm);
  }

  function handleDelete(task) {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Delete task "${task.title}"?`
    );

    if (confirmed) {
      dispatch(deleteTask(task.id));
    }
  }

  return (
    <section className="tasks-page">
      <div className="tasks-heading">
        <div>
          <span className="tasks-eyebrow">FARM OPERATIONS</span>

          <h2>Farm Task Scheduler</h2>

          <p>
            Plan farm activities, track deadlines and monitor task progress.
          </p>
        </div>

        <button
          type="button"
          className="tasks-primary-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {taskCounts.overdue > 0 && (
        <div className="tasks-alert" role="status">
          <AlertTriangle size={21} />

          <div>
            <strong>
              {taskCounts.overdue} overdue{" "}
              {taskCounts.overdue === 1 ? "task" : "tasks"}
            </strong>

            <p>
              Review overdue farm activities and update their status.
            </p>
          </div>
        </div>
      )}

      <div className="tasks-summary-grid">
        <article className="tasks-summary-card">
          <ClipboardList size={23} />
          <p>Total Tasks</p>
          <h3>{taskCounts.total}</h3>
        </article>

        <article className="tasks-summary-card">
          <Clock3 size={23} />
          <p>Pending</p>
          <h3>{taskCounts.pending}</h3>
        </article>

        <article className="tasks-summary-card">
          <AlertTriangle size={23} />
          <p>Overdue</p>
          <h3>{taskCounts.overdue}</h3>
        </article>

        <article className="tasks-summary-card">
          <CheckCircle2 size={23} />
          <p>Completed</p>
          <h3>{taskCounts.done}</h3>
        </article>
      </div>

      <div className="tasks-toolbar">
        <input
          type="search"
          placeholder="Search tasks or crops..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search tasks or crops"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter tasks by status"
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="tasks-list">
          {filteredTasks.map((task) => {
            const crop = crops.find(
              (item) => Number(item.id) === Number(task.cropId)
            );

            const status = getTaskStatus(task, today);

            return (
              <article className="tasks-card" key={task.id}>
                <div className="tasks-card-icon">
                  <Sprout size={24} />
                </div>

                <div className="tasks-card-content">
                  <div className="tasks-card-title-row">
                    <h3>{task.title}</h3>

                    <span
                      className={`task-status task-status-${status.toLowerCase()}`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="tasks-crop-name">
                    Crop: {crop?.name || "Crop unavailable"}
                  </p>

                  <p className="tasks-due-date">
                    <CalendarDays size={16} />
                    Due: {task.dueDate}
                  </p>

                  {task.notes && (
                    <p className="tasks-notes">{task.notes}</p>
                  )}
                </div>

                {isAdmin && (
                  <div className="tasks-card-actions">
                    {task.status !== "Done" && (
                      <button
                        type="button"
                        onClick={() => dispatch(markTaskDone(task.id))}
                        className="task-done-button"
                      >
                        <CheckCircle2 size={16} />
                        Complete
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openEditModal(task)}
                      className="task-edit-button"
                      aria-label={`Edit ${task.title}`}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(task)}
                      className="task-delete-button"
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="tasks-empty-state">
          <ClipboardList size={38} />

          <h3>No tasks found</h3>

          <p>
            Add a farm task or change your search and status filters.
          </p>
        </div>
      )}

      {modalOpen && (
        <div
          className="tasks-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="tasks-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tasks-modal-title"
          >
            <div className="tasks-modal-heading">
              <div>
                <span className="tasks-eyebrow">FARM PLANNING</span>

                <h3 id="tasks-modal-title">
                  {editingId !== null ? "Edit Task" : "Create Task"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            {crops.length === 0 ? (
              <div className="tasks-alert">
                Please add a crop before creating a task.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label>
                  Task title
                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                    placeholder="e.g. Irrigate wheat field"
                    required
                  />
                </label>

                <label>
                  Linked crop
                  <select
                    value={form.cropId}
                    onChange={(event) =>
                      setForm({ ...form, cropId: event.target.value })
                    }
                    required
                  >
                    {crops.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name} — {crop.field}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Due date
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm({ ...form, dueDate: event.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Notes (optional)
                  <textarea
                    rows="3"
                    value={form.notes}
                    onChange={(event) =>
                      setForm({ ...form, notes: event.target.value })
                    }
                    placeholder="Add task instructions..."
                  />
                </label>

                {formError && (
                  <p className="tasks-form-error" role="alert">
                    {formError}
                  </p>
                )}

                <div className="tasks-modal-actions">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="task-cancel-button"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="tasks-primary-button"
                  >
                    {editingId !== null ? "Save Changes" : "Create Task"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export default Tasks;