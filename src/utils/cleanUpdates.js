/**
 * Utility to remove immutable MongoDB and metadata fields from update payloads
 * @param {Object} data 
 * @returns {Object} Cleaned object safe for mongoose updates
 */
export const cleanUpdates = (data = {}) => {
  if (!data || typeof data !== 'object') return {};
  const updates = { ...data };
  delete updates._id;
  delete updates.id;
  delete updates.createdAt;
  delete updates.updatedAt;
  delete updates.__v;
  return updates;
};

export default cleanUpdates;
