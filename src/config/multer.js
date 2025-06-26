const multer = require('multer');
const path = require('path');

// Storage config that selects folder based on field name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profile_image') {
      cb(null, 'uploads/profile_image');
    } else if (file.fieldname === 'identity_image') {
      cb(null, 'uploads/identity_image');

    } 
    else if (file.fieldname === 'tape_image') {
      cb(null, 'uploads/tape_images');
      }
    else if (null, 'voting_card_image') {
      cb(null, 'uploads/voting_card_image');
    }
    
    else {
      cb(new Error('Unknown fieldname'), false);
    }
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + original ext
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Filter to accept only images (jpeg, png, gif)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
