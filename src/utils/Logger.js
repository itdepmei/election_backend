const Log = require('../models/log.model'); // adjust the path if needed

async function addLog({ first_name, second_name = '', last_name, action, message }) {
  try {
    const fullname = [first_name, second_name, last_name].filter(Boolean).join(' ').trim();
    
    const log = await Log.create({ fullname, action, message });
    return log;
  } catch (err) {
    console.error('Failed to add log:', err);
    throw err;
  }
}

module.exports = { addLog };
