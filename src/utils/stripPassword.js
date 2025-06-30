function getFullName(user) {
  if (!user) return '';
  const { first_name = '', second_name = '', last_name = '' } = user;
  return [first_name, second_name, last_name].filter(Boolean).join(' ');
}

 function getImagePath(filename, type) {
  if (!filename) return null;
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  return `${baseUrl}/uploads/${type}/${filename}`;
    // return `/uploads/${type}/${filename}`;


}

function stripPassword(user) {
  if (!user) return user;
  const obj = user.get ? user.get({ plain: true }) : { ...user };
  delete obj.password_hash;

  obj.full_name = getFullName(obj);

  // Add image paths (relative)
  obj.profile_image_url = getImagePath(obj.profile_image, "profile_image");
  obj.identity_image_url = getImagePath(obj.identity_image, "identity_image");
  obj.voting_card_image_url = getImagePath(obj.voting_card_image, "voting_card_image");

  // Remove filename fields
  delete obj.profile_image;
  delete obj.identity_image;
  delete obj.voting_card_image;


  return obj;
}

function stripPasswordFromArray(users) {
  return users.map(stripPassword);
}

module.exports = { stripPassword, stripPasswordFromArray ,getImagePath };