#!/usr/bin/env node
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import Tour from '../src/models/Tour.js';
import DestinationCategory from '../src/models/DestinationCategory.js';

dotenv.config();

const sampleTours = [
    {
        title: 'Séjour au Rajasthan et Bénarès – Le Rajasthan et la rivière Gange',
        duration: '14 Jours / 13 Nuits',
        location: 'Rajasthan & Rivière Gange',
        image: 'https://www.jodhpurvoyage.com/wp-content/uploads/2025/08/image-6.jpg',
        overview: "Un voyage d'exception alliant la féerie des palais des Maharajas (Delhi, Jaïpur, Jodhpur, Udaipur, Agra) et la spiritualité sacrée de Varanasi sur les bords du Gange.",
        badge: 'Populaire',
        price: 0,
        category: 'Rajasthan',
        cityName: 'Jodhpur'
    },
    {
        title: 'Voyage au Rajasthan Hors des Sentiers Battus',
        duration: '15 Jours / 14 Nuits',
        location: 'Villages & Forts Ruraux',
        image: 'https://www.jodhpurvoyage.com/wp-content/uploads/2018/05/Voyage-Rajasthan-Inde.jpg',
        overview: "Immergez-vous dans la vraie vie rurale indienne, dormez dans des havelis de charme et découvrez des palais secrets d'anciens maharajas loin des sentiers battus.",
        badge: 'Authentique',
        price: 0,
        category: 'Rajasthan',
        cityName: 'Jodhpur'
    },
    {
        title: "Le Grand Tour des Cités Royales du Rajasthan",
        duration: '12 Jours / 11 Nuits',
        location: 'Jaïpur, Jodhpur & Jaisalmer',
        image: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/07/Voyage-Jaisalmer.jpg',
        overview: "Un itinéraire grandiose à travers la Ville Rose de Jaïpur, la Ville Bleue de Jodhpur et la Cité Dorée de Jaisalmer aux portes du grand désert du Thar.",
        badge: 'Incontournable',
        price: 0,
        category: 'Rajasthan',
        cityName: 'Jodhpur'
    },
    {
        title: "Rajasthan Romantique & Lacs d'Udaipur",
        duration: '10 Jours / 9 Nuits',
        location: "Udaipur, Ranakpur & Pushkar",
        image: 'https://www.jodhpurvoyage.com/wp-content/uploads/2025/08/image-12.jpg',
        overview: "Une traversée poétique des palais sur le lac Pichola à Udaipur, des temples d'Adinath sculptés à Ranakpur et des rives sacrées du lac de Pushkar.",
        badge: 'Charme & Romantisme',
        price: 0,
        category: 'Rajasthan',
        cityName: 'Udaipur'
    },
    {
        title: 'Désert du Thar & Nuits en Bivouac à Jaisalmer',
        duration: '8 Jours / 7 Nuits',
        location: 'Jaisalmer & Désert du Thar',
        image: 'https://www.jodhpurvoyage.com/wp-content/uploads/2025/08/image-9.jpg',
        overview: "Une expérience féerique dans les sables d'or du désert du Thar : promenade à dos de chameau, nuit sous le ciel étoilé et visite de la citadelle vivante.",
        badge: 'Aventure Désert',
        price: 0,
        category: 'Rajasthan',
        cityName: 'Jaisalmer'
    },
    {
        title: 'Splendeurs des Palais & Havelis du Shekhawati',
        duration: '10 Jours / 9 Nuits',
        location: 'Mandawa, Nawalgarh & Shekhawati',
        image: 'https://www.jodhpurvoyage.com/wp-content/uploads/2025/08/image-7.jpg',
        overview: "Découvrez la plus vaste galerie d'art à ciel ouvert au monde, réputée pour ses demeures marchandes peintes à la main et ses villages authentiques.",
        badge: 'Culture & Patrimoine',
        price: 0,
        category: 'Rajasthan',
        cityName: 'Shekhawati'
    }
];

const run = async () => {
    try {
        await connectDB();

        // Ensure destination category exists
        let dest = await DestinationCategory.findOne({ slug: 'rajasthan' });
        if (!dest) {
            dest = await DestinationCategory.create({
                name: 'Rajasthan',
                tagline: 'La Terre des Maharajas',
                description: 'Rajasthan - palaces, forts, desert and cultural heritage',
                coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2025/08/image-9.jpg',
                order: 1,
                status: 'Active'
            });
            console.log('Created destination category: Rajasthan');
        } else {
            console.log('Destination category already exists');
        }

        for (const t of sampleTours) {
            const slugCandidate = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const existing = await Tour.findOne({ slug: slugCandidate });
            if (existing) {
                console.log(`Skipping existing tour: ${t.title}`);
                continue;
            }

            const doc = new Tour({
                title: t.title,
                duration: t.duration,
                location: t.location,
                image: t.image,
                overview: t.overview,
                badge: t.badge,
                price: t.price || 0,
                category: t.category || 'Rajasthan',
                cityName: t.cityName || 'Jodhpur',
                status: 'Active'
            });

            await doc.save();
            console.log(`Inserted tour: ${t.title}`);
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeder error:', err);
        process.exit(1);
    }
};

run();
