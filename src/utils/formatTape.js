const { getImagePath } = require('./stripPassword'); 

function formatTape(tapeInstance) {
  const tape = tapeInstance.toJSON();
  const user = tape.User;

  // Clean and transform
  const formatted = {
    id: tape.id,
    date: tape.date,
    status: tape.status,
    notes: tape.notes || null,
    tape_image: tape.tape_image || null,
    tape_imageurl: getImagePath(tape.tape_image, "tape_images"),
    added_by: user
      ? [user.first_name, user.second_name, user.last_name].filter(Boolean).join(" ").trim()
      : "غير معروف",

      
    Station: tape.Station || null,
    ElectionCenter: tape.ElectionCenter || null,
  };

  return formatted;
}

module.exports = { formatTape };
