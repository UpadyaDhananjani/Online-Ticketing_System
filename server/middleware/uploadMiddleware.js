// import multer from 'multer';
// import path from 'path';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Ensure this directory exists
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
//     );
//   }
// });

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

export default upload;
