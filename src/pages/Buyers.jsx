import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  ShoppingBag,
  Upload,
  X,
} from "lucide-react";

const CROPS_KEY = "agriflow-crops";
const BUYERS_KEY = "agriflow-buyers";

function readStorage(key, fallback = []) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function formatCNIC(value) {
  const digits = value.replace(/\D/g, "").slice(0, 13);

  if (digits.length <= 5) return digits;
  if (digits.length <= 12) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

function Buyers() {
  const [crops, setCrops] = useState(() =>
    readStorage(CROPS_KEY)
  );

  const [buyers, setBuyers] = useState(() =>
    readStorage(BUYERS_KEY)
  );

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    cnic: "",
    cropId: "",
    quantity: "",
    date: new Date().toISOString().slice(0, 10),
    photo: "",
    photoName: "",
  });

  useEffect(() => {
    localStorage.setItem(BUYERS_KEY, JSON.stringify(buyers));
  }, [buyers]);

  useEffect(() => {
    localStorage.setItem(CROPS_KEY, JSON.stringify(crops));
  }, [crops]);

  const filteredBuyers = buyers.filter((buyer) => {
    const query = search.toLowerCase();

    return (
      buyer.name.toLowerCase().includes(query) ||
      buyer.cnic.includes(query.replace(/\D/g, ""))
    );
  });

  function openForm() {
    setCrops(readStorage(CROPS_KEY));

    setForm({
      name: "",
      cnic: "",
      cropId: "",
      quantity: "",
      date: new Date().toISOString().slice(0, 10),
      photo: "",
      photoName: "",
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
      setError("The photo must be smaller than 1 MB.");
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

    const name = form.name.trim();
    const digits = form.cnic.replace(/\D/g, "");
    const quantity = Number(form.quantity);
    const crop = crops.find(
      (item) => String(item.id) === form.cropId
    );

    if (!/^[a-zA-Z\s]{3,}$/.test(name)) {
      setError(
        "Enter a name containing at least 3 letters and spaces only."
      );
      return;
    }

    if (digits.length !== 13) {
      setError("CNIC must contain exactly 13 digits.");
      return;
    }

    if (buyers.some((buyer) => buyer.cnic.replace(/\D/g, "") === digits)) {
      setError("A buyer with this CNIC is already registered.");
      return;
    }

    if (!crop) {
      setError("Please select a crop.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (quantity > Number(crop.quantity)) {
      setError(
        `Only ${Number(crop.quantity).toLocaleString()} kg of ${crop.name} is available.`
      );
      return;
    }

    if (!form.date) {
      setError("Please select a purchase date.");
      return;
    }

    const updatedCrops = crops.map((item) =>
      item.id === crop.id
        ? {
            ...item,
            quantity: Number(item.quantity) - quantity,
          }
        : item
    );

    const newBuyer = {
      id: Date.now(),
      name,
      cnic: formatCNIC(digits),
      cropId: crop.id,
      cropName: crop.name,
      quantity,
      date: form.date,
      photo: form.photo,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        CROPS_KEY,
        JSON.stringify(updatedCrops)
      );

      localStorage.setItem(
        BUYERS_KEY,
        JSON.stringify([...buyers, newBuyer])
      );

      setCrops(updatedCrops);
      setBuyers((current) => [...current, newBuyer]);

      setModalOpen(false);
      setSuccess(
        `Purchase recorded successfully for ${name}. ${quantity} kg of ${crop.name} deducted from stock.`
      );
    } catch {
      setError(
        "Unable to save the purchase. Your browser storage may be full."
      );
    }
  }

  function deleteBuyer(buyer) {
    const confirmed = window.confirm(
      `Delete the buyer record for ${buyer.name}? This will not reverse the recorded sale.`
    );

    if (confirmed) {
      setBuyers((current) =>
        current.filter((item) => item.id !== buyer.id)
      );
    }
  }

  const totalQuantitySold = buyers.reduce(
    (total, buyer) => total + Number(buyer.quantity),
    0
  );

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
          onClick={openForm}
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

                <button
                  type="button"
                  className="buyer-delete-button"
                  onClick={() => deleteBuyer(buyer)}
                  aria-label={`Delete ${buyer.name}`}
                >
                  <Trash2 size={17} />
                </button>
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
                <h3 id="buyers-modal-title">Register a Buyer</h3>
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
                  <span>{form.photoName}</span>

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
                      {crop.name} — {Number(crop.quantity).toLocaleString()} kg available
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
                  Save Purchase
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