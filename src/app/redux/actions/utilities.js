// Generate REQUEST, SUCCESS and FAILURE action types
export const createRequestTypes = (base) => ({
  REQUEST: `${base}_REQUEST`,
  SUCCESS: `${base}_SUCCESS`,
  FAILURE: `${base}_FAILURE`,
});

// Create a REQUEST action
export const requestAction = (type, payload = null) => ({
  type,
  payload,
});

// Create a SUCCESS action
export const successAction = (type, payload = null) => ({
  type,
  payload,
});

// Create a FAILURE action
export const failureAction = (type, error) => ({
  type,
  payload: error,
  error: true,
});