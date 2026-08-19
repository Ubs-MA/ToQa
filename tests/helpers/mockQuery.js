/**
 * Mongoose queries (e.g. User.findById(id)) are chainable AND thenable —
 * you can call .select()/.sort()/.skip()/.limit() on them, and also `await`
 * them directly. This builds a minimal stand-in with the same shape so
 * service code doesn't need to change to be testable.
 */
function mockQuery(resolvedValue) {
  const query = {
    select: jest.fn(() => query),
    sort: jest.fn(() => query),
    skip: jest.fn(() => query),
    limit: jest.fn(() => query),
    then: (resolve, reject) => Promise.resolve(resolvedValue).then(resolve, reject),
    catch: (reject) => Promise.resolve(resolvedValue).catch(reject),
  };
  return query;
}

module.exports = { mockQuery };
