const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app'); // On importe l'app, pas le serveur !

let mongoServer;

// 1. Démarre la fausse base de données AVANT les tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// 2. Ferme tout APRÈS les tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tests d\'intégration de l\'API', () => {
  it('devrait répondre avec un statut 200 sur la route racine /', async () => {
    const res = await request(app).get('/');
    
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('API Recouvra is running...');
  });
});