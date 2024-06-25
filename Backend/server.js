// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

app.post('/sell', (req, res) => {
  const orderId = Math.floor(1000000000 + Math.random() * 9000000000);
  const { license, total, returnUrl, language } = req.body;

  if (!license || !total || !returnUrl || !language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const redirectUrl = `https://test.satim.guiddini.dz/SATIM-WFGWX-YVC9B-4J6C9/${license}/cib.php?order_id=${orderId}&total=${total}&returnUrl=${returnUrl}&language=${language}`;
  
  res.json({
    redirectUrl,
    orderId,
    total,
    bool: 'true',
    orderNumber: 'orderId'
  });
});

app.get('/payment-callback', async (req, res) => {
  try {
    const { orderNumber, orderId, bool, total, MessageReturn, ErrorCode, code } = req.query;
    const license = 'MY01TP';
    const returnUrl = `${req.protocol}://${req.get('host')}/payment-result`;

    if (!orderNumber || !orderId || bool === undefined || !total || !MessageReturn || !ErrorCode || !code) {
      console.error('Missing parameters:', { orderNumber, orderId, bool, total, MessageReturn, ErrorCode, code });
      return res.status(400).json({ error: 'Invalid parameters from SATIM' });
    }

    console.log('Received from SATIM:', { orderNumber, orderId, bool, total, MessageReturn, ErrorCode, code });

    const validationUrl = `https://test.satim.guiddini.dz/SATIM-WFGWX-YVC9B-4J6C9/${license}/returnCib.php?gatewayOrderId=${orderId}&returnUrl=${encodeURIComponent(returnUrl)}&orderNumber=${orderNumber}&total=${total}`;
    const validationResponse = await axios.get(validationUrl);

    console.log('Validation response from SATIM:', validationResponse.data);

    res.redirect(`${returnUrl}?orderNumber=${orderNumber}&orderId=${orderId}&total=${total}&MessageReturn=${MessageReturn}&ErrorCode=${ErrorCode}&code=${code}&bool=${bool}`);
  } catch (error) {
    console.error('Error during SATIM validation:', error);
    res.status(500).json({ error: 'SATIM validation failed', details: error.message });
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



