require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');

AWS.config.update({
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   region: process.env.AWS_REGION
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/contact', async (req, res) => {
  // access form data from req.body
  const { name, email, message } = req.body;

  const ses = new AWS.SES({ apiVersion: "2010-12-01" });

  const params = {
    Destination: {
      ToAddresses: ["brunsdev1.618@gmail.com"],
    },
    Message: {
      Body: {
        Text: { Data: `${name} (${email}) says: ${message}` },
      },
      Subject: { Data: "Contact Form Submission" },
    },
    Source: "brunsdev1.618@gmail.com",
  };

  try {
    await ses.sendEmail(params).promise();
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in sending email');
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
