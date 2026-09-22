#!/usr/bin/env node
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import Blog from '../src/models/Blog.js';
import Commentaire from '../src/models/Commentaire.js';

dotenv.config();

const sampleBlogs = [
    {
        title: 'Jaisalmer, la ville dorée du désert du Thar',
        excerpt: "On l'appelle la cité dorée en raison de la couleur ocre de sa forteresse et de ses havelis.",
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/07/Voyage-Jaisalmer.jpg',
        category: 'Rajasthan',
        tags: ['rajasthan']
    },
    {
        title: 'Les ghats mystiques de Varanasi le long du Gange',
        excerpt: 'Découvrez la vie spirituelle et les cérémonies ancestrales sur les berges du fleuve sacré.',
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2025/08/image-8.jpg',
        category: 'Spiritualité',
        tags: ['spiritualite']
    },
    {
        title: "Guide complet pour réussir son trek dans l'Himalaya",
        excerpt: "De Pokhara à Katmandou, tout savoir sur la préparation et l'encadrement des randonnées.",
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2025/07/slide8-300x176.jpg',
        category: 'Népal',
        tags: ['nepal']
    },
    {
        title: "Jaipur : Les secrets de la Cité Rose des Maharajas",
        excerpt: "Visitez le Hawa Mahal, le Fort d'Amber et les marchés colorés de la capitale du Rajasthan.",
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2024/07/jaipur-travel.jpg',
        category: 'Rajasthan',
        tags: ['rajasthan']
    },
    {
        title: "Rishikesh : Capitale mondiale du yoga au pied de l'Himalaya",
        excerpt: "Immergez-vous dans la sérénité des ashrams et l'énergie pure des cérémonies Aarti du soir.",
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2016/07/voyage-en-inde-Rishikesh.jpg.jpg',
        category: 'Inde du Nord',
        tags: ['nord']
    },
    {
        title: 'Ladakh : Traversée du Petit Tibet et des cols mythiques',
        excerpt: "Découvrez les monastères bouddhistes perchés et les lacs d'altitude aux eaux turquoise.",
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/08/voyage-au-ladakh-inde.jpg',
        category: 'Ladakh',
        tags: ['ladakh']
    }
];

const sampleReviews = [
    {
        title: 'Voyage au Rajasthan 14 Jours',
        excerpt: '"Bonjour Monsieur Singh, Nous tenons à vous dire à quel point nous avons été ravis par votre organisation..."',
        rating: 5,
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/07/Voyage-Jaisalmer.jpg',
        author: { name: 'Famille & Voyageurs Francophones', avatar: '', location: 'France' },
        tourName: 'Circuit Rajasthan & Varanasi'
    },
    {
        title: "Séjour au Ladakh – Le petit Tibet de l'Inde",
        excerpt: '"Le séjour au Ladakh organisé par l\'agence Jodhpur Voyage s\'est déroulé dans les meilleures conditions possibles."',
        rating: 5,
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/08/voyage-au-ladakh-inde.jpg',
        author: { name: 'Voyageurs du Ladakh', avatar: '', location: 'France' },
        tourName: 'Ladakh Adventure'
    },
    {
        title: 'Circuit & Séjour Punjab & Himachal Pradesh',
        excerpt: '"Comme convenu je reviens vers vous pour faire un petit point sur notre magnifique voyage..."',
        rating: 5,
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/05/Voyage-au-Himachal-en-Inde.jpg',
        author: { name: "Groupe d'Amis Francophones", avatar: '', location: 'France' },
        tourName: 'Punjab & Himachal'
    },
    {
        title: 'Séjour au Rajasthan avec Chauffeur Privé',
        excerpt: '"Nous avons particulièrement apprécié l\'organisation impeccable, les voitures spacieuses..."',
        rating: 5,
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/05/Sejour-au-Rajasthan-avec-chauffeur.jpg',
        author: { name: 'Chantal & Robert', avatar: '', location: 'France' },
        tourName: 'Rajasthan Private'
    },
    {
        title: 'Voyage au Ladakh (8 Jours)',
        excerpt: '"Voici le résumé de notre voyage de 8 jours au Ladakh programmé de main de maître..."',
        rating: 5,
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2022/03/voyage-ladakh.jpeg',
        author: { name: 'Voyageurs Aventuriers', avatar: '', location: 'France' },
        tourName: 'Ladakh 8 Days'
    },
    {
        title: 'Rajasthan Hors Sentiers Battus & Taj Mahal',
        excerpt: '"Voyage exceptionnel hors des circuits touristiques traditionnels..."',
        rating: 5,
        coverImage: 'https://www.jodhpurvoyage.com/wp-content/uploads/2026/05/Voyage-au-Rajasthan-Hors-des-sentiers-battus-avec-Taj-Mahal.jpg',
        author: { name: 'Philippe & Marie L.', avatar: '', location: 'France' },
        tourName: 'Rajasthan Hidden Gems'
    }
];

const run = async () => {
    try {
        await connectDB();

        for (const b of sampleBlogs) {
            const slugCandidate = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const existing = await Blog.findOne({ slug: slugCandidate });
            if (existing) {
                console.log(`Skipping existing blog: ${b.title}`);
                continue;
            }
            await Blog.create({
                title: b.title,
                excerpt: b.excerpt,
                content: b.content || '',
                coverImage: b.coverImage,
                category: b.category || 'Blog',
                tags: b.tags || [],
                status: 'Published'
            });
            console.log(`Inserted blog: ${b.title}`);
        }

        for (const r of sampleReviews) {
            const slugCandidate = r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const existing = await Commentaire.findOne({ slug: slugCandidate });
            if (existing) {
                console.log(`Skipping existing review: ${r.title}`);
                continue;
            }
            await Commentaire.create({
                title: r.title,
                excerpt: r.excerpt,
                content: r.content || r.excerpt || '',
                rating: r.rating || 5,
                coverImage: r.coverImage,
                author: r.author || { name: 'Client Jodhpur Voyage' },
                tourName: r.tourName || '',
                status: 'Published'
            });
            console.log(`Inserted review: ${r.title}`);
        }

        console.log('Static content seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeder error:', err);
        process.exit(1);
    }
};

run();
