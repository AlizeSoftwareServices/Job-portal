const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // I don't have the real email, I will just test the auth syntax
    pass: 'ukzj nqpq qpom lptw'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('FAILED:', error.message);
  } else {
    console.log('SUCCESS:', success);
  }
});
