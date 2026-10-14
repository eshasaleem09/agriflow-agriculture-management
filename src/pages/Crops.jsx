import { Sprout } from "lucide-react";

function Crops() {
  const crops = [
    { id: 1, name: "Wheat", quantity: "2,500 kg", status: "Growing" },
    { id: 2, name: "Rice", quantity: "3,200 kg", status: "Ready to Harvest" },
    { id: 3, name: "Corn", quantity: "1,800 kg", status: "Growing" },
    { id: 4, name: "Cotton", quantity: "950 kg", status: "Growing" },
  ];

  return (
    <section>
      <h2>Crop Management</h2>
      <p>Monitor the crops available on your farm.</p>

      <div className="crop-grid">
        {crops.map((crop) => (
          <article className="panel crop-card" key={crop.id}>
            <Sprout size={28} color="#398653" />

            <h3>{crop.name}</h3>

            <p>Quantity: {crop.quantity}</p>

            <span>{crop.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Crops;