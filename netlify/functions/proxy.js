// netlify/functions/proxy.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  if (!appsScriptUrl) {
    console.error("APPS_SCRIPT_URL environment variable not set.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "APPS_SCRIPT_URL environment variable not set." })
    };
  }

  const url = new URL(appsScriptUrl);
  // Ajouter les query parameters du GET
  for (const key in event.queryStringParameters) {
    url.searchParams.append(key, event.queryStringParameters[key]);
  }

  let requestOptions = {
    method: event.httpMethod,
    headers: {} // Initialiser les headers
  };

  if (event.httpMethod === 'POST') {
    requestOptions.headers['Content-Type'] = 'application/json';
    // Le corps de la requête POST est déjà une chaîne dans event.body pour les fonctions Netlify
    requestOptions.body = event.body;
    console.log("Proxy POST request body:", event.body); // Pour le débogage
  } else if (event.httpMethod === 'OPTIONS') {
    // Pour la preflight OPTIONS request, Content-Type peut être vide ou un autre type
    // On ne met pas de corps pour OPTIONS
    console.log("Proxy OPTIONS request received.");
  }

  try {
    const response = await fetch(url.toString(), requestOptions);
    const data = await response.text(); // Récupère le texte brut pour éviter les erreurs de parsing

    console.log("Proxy response status:", response.status);
    console.log("Proxy response headers:", response.headers.raw());
    console.log("Proxy response body (truncated):", data.substring(0, 200)); // Log partiel du corps

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': 'https://wallfeedapp.netlify.app', // Spécifique à votre domaine Netlify
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400' // Cache preflight requests for 24 hours
      },
      body: data // Renvoyer le corps brut tel quel
    };
  } catch (error) {
    console.error("Proxy fetch error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Proxy error: ${error.message}` })
    };
  }
};
