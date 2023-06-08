require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const AWS = require('aws-sdk');

const githubToken = process.env.GITHUB_TOKEN;

axios.defaults.headers.common = { Authorization: `Bearer ${githubToken}` };

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

app.get('/projects', async (req, res) => {
  try {
    const { data: repos } = await axios.get('https://api.github.com/users/dustynbruns/repos');

    const projects = await Promise.all(repos.map(async (repo) => {
      try {
        const { data: readme } = await axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`);

        const readmeContent = Buffer.from(readme.content, 'base64').toString();

        return { ...repo, readme: readmeContent };
      } catch (error) {
        return repo;
      }
    }));

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching projects.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

