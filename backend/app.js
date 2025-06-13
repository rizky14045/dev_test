const express = require('express');
const db = require('./db');
const app = express();
const port = 8090;

app.get('/chart', async (req, res) => {
  try {
    const { start_date, end_date, area } = req.query;

    let query = db('report_product')
        .join('store', 'store.store_id','report_product.store_id')
        .join('store_area', 'store_area.area_id','store.area_id')
        .select('store.area_id','store_area.area_name')
        .sum('compliance as total_compliance')
        .count('compliance as total_data')
        .groupBy('area_id');

    if (start_date && end_date) {
      query = query.whereBetween('report_product.tanggal', [start_date, end_date]);
    }

    if (area && area !== '0'  ) {
      query = query.where('store.area_id', area);
    }

    const result = await query;

    const labels = [];
    const data = [];

    result.forEach(row => {
      const totalCompliance = parseFloat(row.total_compliance);
      const totalData = parseInt(row.total_data);
      const percentage = totalData > 0 ? (totalCompliance / totalData) * 100 : 0;

      labels.push(row.area_name);
      data.push(parseFloat(percentage.toFixed(2)));
    });

    res.json({ labels, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/get-area', async (req, res) => {
  try {

    let query = db('store_area').select('*')

    const area = await query;


    res.json({area});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
