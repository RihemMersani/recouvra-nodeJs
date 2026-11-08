describe('Test E2E - Parcours CRUD Complet', () => {
  const apiUrl = 'http://localhost:3000/api';
  let token;

  before(() => {
    // 1. On s'assure que l'admin existe et on récupère son token
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/register`,
      body: { name: 'Admin E2E', email: 'admin@test.com', password: 'password123', role: 'admin' },
      failOnStatusCode: false
    });

    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: { email: 'admin@test.com', password: 'password123' }
    }).then((res) => {
      token = res.body.token; // On sauvegarde le token pour les requêtes suivantes
    });
  });

  it('Devrait créer, lire et supprimer un client', () => {
       const newClient = {
      name: 'Client Cypress E2E',
      email: `test-${Date.now()}@client.com`, // Email unique
      phone: '0612345678',
      company: 'Ma Super Entreprise',
      notes: 'Un client créé par Cypress'
    };

    // 1. CREATE (POST) - On crée un client
    cy.request({
      method: 'POST',
      url: `${apiUrl}/clients`,
      headers: { Authorization: `Bearer ${token}` },
      body: newClient
    }).then((createRes) => {
      expect(createRes.status).to.eq(201);
      const clientId = createRes.body._id;
      
      // 2. READ (GET) - On vérifie qu'il a bien été créé
      cy.request({
        method: 'GET',
        url: `${apiUrl}/clients/${clientId}`,
        headers: { Authorization: `Bearer ${token}` }
      }).then((getRes) => {
        expect(getRes.status).to.eq(200);
        expect(getRes.body.name).to.eq('Client Cypress E2E');

        // 3. DELETE (DELETE) - On le supprime pour nettoyer la base
        cy.request({
          method: 'DELETE',
          url: `${apiUrl}/clients/${clientId}`,
          headers: { Authorization: `Bearer ${token}` }
        }).then((deleteRes) => {
          expect(deleteRes.status).to.be.oneOf([200, 204]); // Selon votre code
        });
      });
    });
  });
});