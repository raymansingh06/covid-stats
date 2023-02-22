const express = require('express');
const { collection } = require('../../../../GID/insta-project/backend/instaclone-node/model/user');
const app = express()
const port = 8080
// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')

console.log(connection)
app.get('/totalRecovered', async (req, res) => {
    const result = await connection.aggregate([
      { $group: { _id: 'total', recovered: { $sum: '$recovered' } } }
    ])
  
    res.json({ data: result });
  });

  app.get('/totalActive', async (req, res) => {
   const result = await connection.aggregate([
      {
        $group: {
          _id: 'total',
          active: { $sum: { $subtract: ['$infected', '$recovered'] } }
        }
      },
      {
        $project: {
          _id: 0,
          active: 1
        }
      }
    ])

    res.json({
        data:result
    })
  });

  
app.get('/totalDeath', async (req, res) => {
    const result = await connection.aggregate([
      { $group: { _id: 'total', death: { $sum: '$death' } } }
    ]);
  
    res.json({ data: result });
  });


  app.get('/hotspotStates', async (req, res) => {

      const result = await connection.aggregate([
        {
            $project: {
              _id: 0,
              state: 1,
              rate: { $round: [{ $divide: [{ $subtract: ['$infected', '$recovered'] }, '$infected'] }, 5] },
            },
          },
          { $match: { rate: { $gt: 0.1 } } },
      ]);
      res.json({ data: result });
    
  });
  
  app.get('/healthyStates', async (req, res) => {
  
      const result = await connection.aggregate([
        {
            $project: {
              _id: 0,
              state: 1,
              mortality: { $round: [{ $divide: ['$death', '$infected'] }, 5] },
            },
          },
          { $match: { mortality: { $lt: 0.005 } } },
      ])
      res.json({ data: result });
   
  });


app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;