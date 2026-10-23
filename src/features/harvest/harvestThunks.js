import { addOrder, deleteOrder } from "./harvestSlice.js";
import { updateCrop } from "../crops/cropsSlice.js";

// Create an order and deduct crop stock.
export const createOrderWithStock = (order) => (dispatch, getState) => {
  const state = getState();
  const crop = state.crops.find(
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

  const availableStock = Number(crop.quantity || 0);

  if (quantity > availableStock) {
    return {
      ok: false,
      message: `Insufficient ${crop.name} stock. Available: ${availableStock} kg.`,
    };
  }

  dispatch(
    updateCrop({
      ...crop,
      quantity: availableStock - quantity,
    })
  );

  dispatch(
    addOrder({
      ...order,
      quantity,
      stockDeducted: true,
    })
  );

  return {
    ok: true,
    message: "Order created and crop stock updated successfully.",
  };
};

// Delete an order and restore its allocated stock.
export const deleteOrderWithStock = (orderId) => (
  dispatch,
  getState
) => {
  const state = getState();

  const order = state.harvest.orders.find(
    (item) => item.id === orderId
  );

  if (!order) {
    return {
      ok: false,
      message: "Order not found.",
    };
  }

  if (order.stockDeducted === true) {
    const crop = state.crops.find(
      (item) => item.name === order.crop
    );

    if (!crop) {
      return {
        ok: false,
        message: `Cannot restore stock because ${order.crop} was not found. The order was not deleted.`,
      };
    }

    dispatch(
      updateCrop({
        ...crop,
        quantity:
          Number(crop.quantity || 0) +
          Number(order.quantity || 0),
      })
    );
  }

  dispatch(deleteOrder(orderId));

  return {
    ok: true,
    message: `${order.id} deleted successfully.`,
  };
};
