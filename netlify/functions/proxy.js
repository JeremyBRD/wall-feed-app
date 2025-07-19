// netlify/functions/proxy.js
const fetch = require('node-fetch'); // Nécessaire si vous utilisez Node.js < 18

exports.handler = async function(event, context) {
  const appsScriptUrl = process.env.APPS_SCRIPT_URL; // Stockez votre URL Apps Script dans les variables d'environnement Netlify

  if (!appsScriptUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "APPS_SCRIPT_URL environment variable not set." })
    };
  }

  // Reconstruire l'URL avec les query parameters du frontend
  const url = new URL(appsScriptUrl);
  for (const key in event.queryStringParameters) {
    url.searchParams.append(key, event.queryStringParameters[key]);
  }

  try {
    let response;
    if (event.httpMethod === 'POST') {
      // Gérer les requêtes POST
      response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body // Le corps de la requête POST du frontend
      });
    } else {
      // Gérer les requêtes GET (et OPTIONS si elles sont redirigées ici)
      response = await fetch(url.toString(), {
        method: event.httpMethod // Utilisez la méthode originale (GET, OPTIONS)
      });
    }

    const data = await response.text(); // Utilisez .text() pour éviter les erreurs de parsing si le JSON est invalide

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*', // Autorise toutes les origines pour le proxy, ou 'https://wallfeedapp.netlify.app'
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400' // Cache preflight requests for 24 hours
      },
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Proxy error: ${error.message}` })
    };
  }
};
