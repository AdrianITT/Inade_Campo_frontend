// apis/helpers.js
export const upsert = async (id, createFn, updateFn, payload) => {
  if (id) {
    await updateFn(id, payload);      // PATCH
    return id;
  }
  const { data } = await createFn(payload);  // POST
  return data.id;
};
