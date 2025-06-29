// utils/logger.js or services/logger.js
const Log = require('../models/log.model'); // adjust the path as needed

async function addLog({ fullname, action, message }) {
  try {
    const log = await Log.create({ fullname, action, message });
    return log;
  } catch (err) {
    console.error('Failed to add log:', err);
    // You can choose to throw the error or just swallow it depending on your use case
    throw err;
  }
}

module.exports = { addLog };
