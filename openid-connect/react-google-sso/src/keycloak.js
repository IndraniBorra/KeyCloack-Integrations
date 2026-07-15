import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://auth.savvytechies.com',
  realm: 'utdallas-eng',
  clientId: 'react-client-sso',
});

export default keycloak;
