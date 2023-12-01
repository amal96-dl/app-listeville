const express = require('express');
const axios = require('axios');

const app = express();
//Create Router 
app.get('/cities/:zipcode', async (req, res) => {
  const zipcode = req.params.zipcode;

    try {
        // Valider le paramètre 'zipcode' que doit être une chaîne de 5 chiffres
        if (!zipcode || typeof zipcode !== 'string' || !/^\d{5}$/.test(zipcode)) {
        throw new Error('Le paramètre "zipcode" est requis et doit être une chaîne de 5 chiffres.');
        }

        // Faire une requête à l'API GeoGouv
        const response = await axios.get(`https://geo.api.gouv.fr/communes?codePostal=${zipcode}`);

        // Vérifier le code de statut HTTP de la réponse de l'API GeoGouv
        if (response.status !== 200) {
        throw new Error(`Réponse de l'API GeoGouv avec le code de statut ${response.status}.`);
        }

        // Vérifier si la réponse de l'API GeoGouv est vide
        if (response.data.length === 0) {
        return res.json({ success: false, error: 'Aucune ville trouvée pour le code postal spécifié.' });
        }

        // Extraire les noms des villes de la réponse de l'API
        const cities = response.data.map(city => city.nom);

        // Renvoyer la réponse avec les noms des villes
        res.json({ success: true, cities });
    }
    catch (error) {
        // Gérer les erreurs
        console.error('Erreur:', error.message);

        let errorMessage = 'Erreur lors du traitement de la requête.';
        
    
        // Si c'est une erreur de validation, ajuster le message d'erreur
        if (error.message.startsWith(`Le paramètre n'est pas valide `)) {
            errorMessage = error.message;
        } 
        else if (error.response && error.response.data && error.response.data.message)
        {
            // Si l'API GeoGouv renvoie une erreur de validation, utiliser le message d'erreur de l'API
            errorMessage = `Erreur de validation de l'API GeoGouv: ${error.response.data.message}`;
            }

        res.status(400).json({ success: false, error: errorMessage });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
