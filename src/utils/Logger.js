const Log = require('../models/log.model'); // adjust the path if needed

async function addLog({ first_name, second_name = '', last_name, action, message , campaign_id }) {
  try {
    const fullname = [first_name, second_name, last_name].filter(Boolean).join(' ').trim();
    
    const log = await Log.create({ fullname, action, message , campaign_id });
    return log;
  } catch (err) {
    console.error('Failed to add log:', err);
    throw err;
  }
}


async function addLogByCampaign({
  first_name = "",
  second_name = "",
  last_name = "",
  action = "",
  message = "",
  campaign_id,
}) {
  if (!campaign_id) {
    throw new Error("campaign_id is required for logging by campaign");
  }
  return await Log.create({
    first_name,
    second_name,
    last_name,
    action,
    message,
    campaign_id,
  });

}
module.exports = { addLog  , addLogByCampaign };
