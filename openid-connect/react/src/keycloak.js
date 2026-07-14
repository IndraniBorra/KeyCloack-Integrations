import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://auth.savvytechies.com',
  realm: 'utdallas-cs',
  clientId: 'react-client',
});

export default keycloak;
