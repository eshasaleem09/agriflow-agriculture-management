import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addBuyer,
  updateBuyer,
  deleteBuyer,
} from "../features/buyers/buyersSlice.js";

import { updateCrop } from "../features/crops/cropsSlice.js";

import {
  Users,
  UserPlus,
  Search,
  Trash2,
  ShoppingBag,
  Upload,
  X,
  Pencil,
} from "lucide-react";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCNIC(value) {
  const digits = value.replace(/\D/g, "").slice(0, 13);

  if (digits.length <= 5) {
    return digits;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

function Buyers() {
  const dispatch = useDispatch();

  const crops = useSelector((state) => state.crops);
  const buyers = useSelector((state) => state.buyers);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === "Admin";

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm = {
    name: "",
    cnic: "",
    cropId: "",
    quantity: "",
    date: getLocalDate(),
    photo: "",
    photoName: "",
  };

  const [form, setForm] = useState(emptyForm);

  const filteredBuyers = buyers.filter((buyer) => {
    const query = search.toLowerCase();
    const digits = search.replace(/\D/g, "");

    return (
      (buyer.name || "").toLowerCase().includes(query) ||
      (buyer.cnic || "").replace(/\D/g, "").includes(digits)
    );
  });

  const totalQuantitySold = buyers.reduce(
    (total, buyer) => total + Number(buyer.quantity || 0),
    0
  );

  function openAddForm() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      cropId: "",
      date: getLocalDate(),
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditForm(buyer) {
    if (!isAdmin) return;

    setEditingId(buyer.id);

    setForm({
      name: buyer.name || "",
      cnic: buyer.cnic || "",
      cropId: String(buyer.cropId),
      quantity: String(buyer.quantity),
      date: buyer.date || getLocalDate(),
      photo: buyer.photo || "",
      photoName: buyer.photoName || "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please upload a JPG or PNG image.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("The photo must not exceed 1 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((current) => ({
        ...current,
        photo: reader.result,
        photoName: file.name,
      }));

      setError("");
    };

    reader.onerror = () => {
      setError("Unable to read this photo. Please try another.");
    };

    reader.readAsDataURL(file);
  }

  function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (editingId !== null && !isAdmin) {
      setError("Only an Admin can edit buyer records.");
      return;
    }

    const name = form.name.trim();
    const digits = form.cnic.replace(/\D/g, "");
    const quantity = Number(form.quantity);
    const selectedCrop = crops.find(
      (crop) => String(crop.id) === form.cropId
    );

    // Validate name: letters and spaces only, at least 3 letters
    if (
      !/^[a-zA-Z\s]+$/.test(name) ||
      name.replace(/\s/g, "").length < 3
    ) {
      setError(
        "Enter a name containing at least 3 letters and spaces only."
      );
      return;
    }

    // Validate CNIC
    if (digits.length !== 13) {
      setError("CNIC must contain exactly 13 digits.");
      return;
    }

    // Prevent duplicate CNIC, except for the buyer being edited
    const duplicate = buyers.some(
      (buyer) =>
        buyer.id !== editingId &&
        (buyer.cnic || "").replace(/\D/g, "") === digits
    );

    if (duplicate) {
      setError("A buyer with this CNIC is already registered.");
      return;
    }

    if (!selectedCrop) {
      setError("Please select a valid crop.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (!form.date) {
      setError("Please select a purchase date.");
      return;
    }

    const existingBuyer = buyers.find(
      (buyer) => buyer.id === editingId
    );

    const oldCrop = existingBuyer
      ? crops.find(
          (crop) => String(crop.id) === String(existingBuyer.cropId)
        )
      : null;

    // If editing a purchase for the same crop, include its previous
    // quantity when calculating how much stock is available.
    const availableQuantity =
      existingBuyer && oldCrop?.id === selectedCrop.id
        ? Number(selectedCrop.quantity) + Number(existingBuyer.quantity)
        : Number(selectedCrop.quantity);

    if (quantity > availableQuantity) {
      setError(
        `Only ${availableQuantity.toLocaleString()} kg of ${selectedCrop.name} is available for this purchase.`
      );
      return;
    }

    const buyerData = {
      id: editingId ?? Date.now(),
      name,
      cnic: formatCNIC(digits),
      cropId: selectedCrop.id,
      cropName: selectedCrop.name,
      quantity,
      date: form.date,
      photo: form.photo,
      photoName: form.photoName,
      createdAt:
        existingBuyer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingBuyer) {
      // Editing a purchase on the same crop adjusts only the
      // net quantity difference.
      if (oldCrop && String(oldCrop.id) === String(selectedCrop.id)) {
        dispatch(
          updateCrop({
            ...oldCrop,
            quantity:
              Number(oldCrop.quantity) +
              Number(existingBuyer.quantity) -
              quantity,
          })
        );
      } else {
        // Restore the old crop stock first.
        if (oldCrop) {
          dispatch(
            updateCrop({
              ...oldCrop,
              quantity:
                Number(oldCrop.quantity) +
                Number(existingBuyer.quantity),
            })
          );
        }

        // Deduct the new purchase from the selected crop.
        dispatch(
          updateCrop({
            ...selectedCrop,
            quantity:
              Number(selectedCrop.quantity) - quantity,
          })
        );
      }

      dispatch(updateBuyer(buyerData));

      setSuccess(`Buyer record updated for ${name}.`);
    } else {
      // Deduct stock for a new purchase.
      dispatch(
        updateCrop({
          ...selectedCrop,
          quantity:
            Number(selectedCrop.quantity) - quantity,
        })
      );

      dispatch(addBuyer(buyerData));

      setSuccess(
        `Purchase recorded for ${name}. ${quantity} kg of ${selectedCrop.name} deducted from stock.`
      );
    }

    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function handleDeleteBuyer(buyer) {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Delete ${buyer.name}'s purchase and return ${buyer.quantity} kg to the crop stock?`
    );

    if (!confirmed) return;

    const crop = crops.find(
      (item) => String(item.id) === String(buyer.cropId)
    );

    // Restore the stock associated with the deleted purchase.
    if (crop) {
      dispatch(
        updateCrop({
          ...crop,
          quantity:
            Number(crop.quantity) + Number(buyer.quantity),
        })
      );
    }

    dispatch(deleteBuyer(buyer.id));

    setSuccess(
      `Buyer record for ${buyer.name} deleted and stock adjusted.`
    );
  }

  return (
    <section className="buyers-page">
      <div className="buyers-heading">
        <div>
          <span className="buyers-eyebrow">FARM OPERATIONS</span>

          <h2>Buyer Management</h2>

          <p>
            Register buyers, record crop purchases, and track sales.
          </p>
        </div>

        <button
          type="button"
          className="buyers-primary-button"
          onClick={openAddForm}
        >
          <UserPlus size={18} />
          Register Buyer
        </button>
      </div>

      {success && (
        <div className="buyers-success" role="status">
          {success}

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="buyers-summary">
        <article className="panel buyers-summary-card">
          <Users size={23} />

          <div>
            <p>Registered Buyers</p>
            <h3>{buyers.length}</h3>
          </div>
        </article>

        <article className="panel buyers-summary-card">
          <ShoppingBag size={23} />

          <div>
            <p>Quantity Sold</p>
            <h3>{totalQuantitySold.toLocaleString()} kg</h3>
          </div>
        </article>
      </div>

      <div className="panel buyers-toolbar">
        <Search size={19} />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search buyers by name or CNIC..."
          aria-label="Search buyers"
        />
      </div>

      <div className="buyers-list-heading">
        <div>
          <h3>Registered Buyers</h3>

          <p>
            Showing {filteredBuyers.length} of {buyers.length} records
          </p>
        </div>
      </div>

      {filteredBuyers.length === 0 ? (
        <div className="panel buyers-empty">
          <Users size={35} />
          <h3>No buyers found</h3>

          <p>
            Register your first buyer or try a different search.
          </p>
        </div>
      ) : (
        <div className="buyers-grid">
          {filteredBuyers.map((buyer) => (
            <article className="panel buyer-card" key={buyer.id}>
              <div className="buyer-card-top">
                {buyer.photo ? (
                  <img
                    src={buyer.photo}
                    alt={`${buyer.name}'s photo`}
                    className="buyer-photo"
                  />
                ) : (
                  <div className="buyer-avatar">
                    {buyer.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="buyer-main-info">
                  <h3>{buyer.name}</h3>
                  <p>{buyer.cnic}</p>
                </div>

                {isAdmin && (
                  <div className="buyer-actions">
                    <button
                      type="button"
                      className="buyer-edit-button"
                      onClick={() => openEditForm(buyer)}
                      aria-label={`Edit ${buyer.name}`}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="buyer-delete-button"
                      onClick={() => handleDeleteBuyer(buyer)}
                      aria-label={`Delete ${buyer.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                )}
              </div>

              <div className="buyer-detail-row">
                <span>Crop purchased</span>
                <strong>{buyer.cropName}</strong>
              </div>

              <div className="buyer-detail-row">
                <span>Quantity</span>
                <strong>
                  {Number(buyer.quantity).toLocaleString()} kg
                </strong>
              </div>

              <div className="buyer-detail-row">
                <span>Purchase date</span>
                <strong>{buyer.date}</strong>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="buyers-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="buyers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="buyers-modal-title"
          >
            <div className="buyers-modal-heading">
              <div>
                <span className="buyers-eyebrow">
                  CUSTOMER RECORDS
                </span>

                <h3 id="buyers-modal-title">
                  {editingId !== null
                    ? "Edit Buyer"
                    : "Register a Buyer"}
                </h3>
              </div>

              <button
                type="button"
                className="buyers-close-button"
                onClick={() => setModalOpen(false)}
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="buyers-form">
              <label>
                Full Name

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Ahmed Khan"
                  required
                />
              </label>

              <label>
                CNIC

                <input
                  type="text"
                  inputMode="numeric"
                  value={form.cnic}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      cnic: formatCNIC(event.target.value),
                    })
                  }
                  placeholder="12345-1234567-1"
                  maxLength={15}
                  required
                />

                <small>Enter your 13-digit CNIC number.</small>
              </label>

              <label>
                Buyer Photo (JPG or PNG, maximum 1 MB)

                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhoto}
                />
              </label>

              {form.photo && (
                <div className="buyers-photo-preview">
                  <img src={form.photo} alt="Buyer preview" />

                  <span>{form.photoName || "Uploaded photo"}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        photo: "",
                        photoName: "",
                      })
                    }
                  >
                    Remove photo
                  </button>
                </div>
              )}

              <label>
                Crop

                <select
                  value={form.cropId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      cropId: event.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select a crop</option>

                  {crops.map((crop) => (
                    <option
                      key={crop.id}
                      value={String(crop.id)}
                      disabled={Number(crop.quantity) <= 0}
                    >
                      {crop.name} —{" "}
                      {Number(crop.quantity).toLocaleString()} kg available
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quantity (kg)

                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      quantity: event.target.value,
                    })
                  }
                  placeholder="Enter quantity"
                  required
                />
              </label>

              <label>
                Purchase Date

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      date: event.target.value,
                    })
                  }
                  required
                />
              </label>

              {error && (
                <p className="buyers-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="buyers-form-actions">
                <button
                  type="button"
                  className="buyers-cancel-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="buyers-primary-button"
                >
                  <Upload size={17} />
                  {editingId !== null
                    ? "Save Changes"
                    : "Save Purchase"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default Buyers;