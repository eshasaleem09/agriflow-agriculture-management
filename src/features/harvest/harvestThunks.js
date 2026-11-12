import { apiClient } from "../../app/redux/api/index.js";
import {
  addOrder,
  updateOrder,
  deleteOrder,
  setOrders,
} from "./harvestSlice.js";

// Refresh crop quantities from PostgreSQL
const refreshCrops = async (dispatch) => {
  const response = await apiClient.get("/crops");

  const crops = response.data.data.map((crop) => ({
    ...crop,
    quantity: Number(crop.expectedQty || 0),
    health: Number(crop.healthScore || 0),
  }));

  dispatch({
    type: "app/HYDRATE_STATE",
    payload: { crops },
  });
};

// FETCH ORDERS
export const fetchOrders = () => async (dispatch) => {
  try {
    const response = await apiClient.get("/orders");
    dispatch(setOrders(response.data.data || []));

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Could not load orders.",
    };
  }
};

// CREATE ORDER
export const createOrderWithStock = (order) => async (
  dispatch,
  getState
) => {
  try {
    const crop = getState().crops.find(
      (item) => item.name === order.crop
    );

    const quantity = Number(order.quantity);

    if (!crop) {
      return {
        ok: false,
        message: "The selected crop could not be found.",
      };
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return {
        ok: false,
        message: "Please enter a valid order quantity.",
      };
    }

    const response = await apiClient.post("/orders", {
      customer: order.customer,
      cropId: crop.id,
      quantity,
      status: order.status || "Pending",
      orderDate: order.orderDate || new Date().toISOString().slice(0, 10),
    });

    dispatch(addOrder(response.data.data));

    await refreshCrops(dispatch);

    return {
      ok: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Could not create order.",
    };
  }
};

// UPDATE ORDER STATUS
export const updateOrderOnServer = (orderId, status) => async (
  dispatch
) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}`, {
      status,
    });

    dispatch(updateOrder(response.data.data));

    return {
      ok: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Could not update order.",
    };
  }
};

// DELETE ORDER
export const deleteOrderWithStock = (orderId) => async (
  dispatch
) => {
  try {
    const response = await apiClient.delete(`/orders/${orderId}`);

    dispatch(deleteOrder(orderId));

    await refreshCrops(dispatch);

    return {
      ok: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Could not delete order.",
    };
  }
};