import { ShoppingCart } from "lucide-react";

function Orders() {
  const orders = [
    {
      id: "ORD-1024",
      customer: "Ahmed Khan",
      crop: "Wheat",
      quantity: "500 kg",
      status: "Delivered",
    },
    {
      id: "ORD-1025",
      customer: "Fatima Ali",
      crop: "Rice",
      quantity: "300 kg",
      status: "Pending",
    },
    {
      id: "ORD-1026",
      customer: "Usman Malik",
      crop: "Corn",
      quantity: "200 kg",
      status: "Processing",
    },
  ];

  return (
    <section>
      <h2>Order Management</h2>
      <p>Track customer orders and crop deliveries.</p>

      <article className="panel orders-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>CROP</th>
                <th>QUANTITY</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.crop}</td>
                  <td>{order.quantity}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 20 }}>
          <ShoppingCart size={24} color="#398653" />
          <p>Order management page</p>
        </div>
      </article>
    </section>
  );
}

export default Orders;