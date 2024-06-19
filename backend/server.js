const express = require('express');
const axios = require('axios');
const cors = require('cors');
const async = require('async');

const app = express();
const port = 5000;

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,POST',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/api/first', (req, res) => {
  const { licence, order_id, total, returnUrl, language } = req.body;

  async.series([
    // First API call
    (callback) => {
      axios.get(`https://test.satim.guiddini.dz/SATIM-WFGWX-YVC9B-4J6C9/${licence}/cib.php`, {
        params: {
          order_id,
          total,
          returnUrl,
          language
        }
      })
      .then(response => {
        const { gatewayOrderId, orderNumber } = response.data;
        if (!gatewayOrderId || !orderNumber) {
          return callback(new Error('Required data missing in the first API response'));
        }
        callback(null, { gatewayOrderId, orderNumber });
      })
      .catch(error => {
        console.error('Error during first API call:', error.message);
        callback(error);
      });
    },
    // Second API call
    (resultsFromFirstCall, callback) => {
      const { gatewayOrderId, orderNumber } = resultsFromFirstCall;
      axios.get(`https://test.satim.guiddini.dz/SATIM-WFGWX-YVC9B-4J6C9/${licence}/returnCib.php`, {
        params: {
          gatewayOrderId,
          returnUrl,
          orderNumber,
          total
        }
      })
      .then(response => {
        callback(null, response.data);
      })
      .catch(error => {
        console.error('Error during second API call:', error.message);
        callback(error);
      });
    }
  ], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[1]); 
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
