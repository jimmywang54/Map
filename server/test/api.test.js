const request = require('supertest');

const app = require('../src/app');

describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - 👋🌎🌍🌏'
      }, done);
  });
});

describe('POST /api/v1/messages', () => {
  it('responds with inserted messgae', (done) => {
    const requestObj = {
      name: 'Jimmy',
      message: 'This app is so cool',
      latitude: -90,
      longitude: 180
    };

    const responseObj = {
      ...requestObj,
      _id: '5d10706b1fe49a6cba7b6d17',
      date: '2019-06-24T06:40:43.184Z'
    }
    request(app)
      .post('/api/v1/messages')
      .send(requestObj)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body._id = '5d10706b1fe49a6cba7b6d17';
        res.body.date = '2019-06-24T06:40:43.184Z';
      })
      .expect(200, responseObj, done);
  });


  it('can signup with a name that has diacritics', (done) => {
    const requestObj = {
      name: 'Ÿööhöö',
      message: 'This app is so cool',
      latitude: -90,
      longitude: 180
    };

    const responseObj = {
      ...requestObj,
      _id: '5d10706b1fe49a6cba7b6d17',
      date: '2019-06-24T06:40:43.184Z'
    }
    request(app)
      .post('/api/v1/messages')
      .send(requestObj)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body._id = '5d10706b1fe49a6cba7b6d17';
        res.body.date = '2019-06-24T06:40:43.184Z';
      })
      .expect(200, responseObj, done);
  })
});
