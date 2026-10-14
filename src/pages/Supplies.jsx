import { Package } from "lucide-react";

function Supplies() {
  const supplies = [
    { name: "Wheat Seeds", quantity: "150 kg", status: "Available" },
    { name: "Organic Fertilizer", quantity: "80 bags", status: "Available" },
    { name: "Irrigation Equipment", quantity: "12 units", status: "Limited" },
    { name: "Pesticides", quantity: "25 bottles", status: "Available" },
  ];

  return (
    <section>
      <h2>Farm Supplies</h2>
      <p>View the agricultural supplies available on your farm.</p>

      <div className="crop-grid">
        {supplies.map((item) => (
          <article className="panel crop-card" key={item.name}>
            <Package size={28} color="#398653" />

            <h3>{item.name}</h3>

            <p>Quantity: {item.quantity}</p>

            <span>{item.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Supplies;