const createResponse = (succeeded, message, data = null) => ({
  data: {
    succeeded,
    message,
    data,
  },
});

const isStorageAvailable = () => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

export const storageApi = {
  getItem: async (key, fallback = null) => {
    try {
      if (!isStorageAvailable()) {
        throw new Error("Local storage is unavailable.");
      }

      const savedData = localStorage.getItem(key);

      if (savedData === null) {
        return createResponse(true, "No saved data found.", fallback);
      }

      const parsedData = JSON.parse(savedData);

      return createResponse(
        true,
        "Data retrieved successfully.",
        parsedData
      );
    } catch (error) {
      return createResponse(
        false,
        error.message || "Unable to retrieve data.",
        fallback
      );
    }
  },

  setItem: async (key, value) => {
    try {
      if (!isStorageAvailable()) {
        throw new Error("Local storage is unavailable.");
      }

      localStorage.setItem(key, JSON.stringify(value));

      return createResponse(
        true,
        "Data saved successfully.",
        value
      );
    } catch (error) {
      return createResponse(
        false,
        error.message || "Unable to save data."
      );
    }
  },

  removeItem: async (key) => {
    try {
      if (!isStorageAvailable()) {
        throw new Error("Local storage is unavailable.");
      }

      localStorage.removeItem(key);

      return createResponse(
        true,
        "Data removed successfully."
      );
    } catch (error) {
      return createResponse(
        false,
        error.message || "Unable to remove data."
      );
    }
  },
};