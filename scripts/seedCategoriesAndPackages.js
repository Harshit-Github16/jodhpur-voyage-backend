#!/usr/bin/env node
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import DestinationCategory from '../src/models/DestinationCategory.js';
import Tour from '../src/models/Tour.js';

dotenv.config();

const categories = [
    { name: 'Rajasthan', coverImage: '/images/dest-rajasthan.jpg' },
    { name: 'Gujarat', coverImage: '/images/dest-gujarat.jpg' },
    { name: 'Karnataka', coverImage: '/images/dest-karnataka.jpg' },
    { name: 'Népal', coverImage: '/images/dest-nepal.jpg' },
    { name: 'Orissa', coverImage: '/images/dest-orissa.jpg' },
    { name: 'Ladakh', coverImage: '/images/dest-ladakh.jpg' },
    { name: 'Varanasi', coverImage: '/images/dest-varanasi.jpg' },
    { name: 'Kerala', coverImage: '/images/dest-kerala.jpg' },
    { name: 'Tamil Nadu', coverImage: '/images/dest-tamilnadu.jpg' },
    { name: 'Kathmandu', coverImage: '/images/dest-kathmandu.jpg' },
    { name: 'Chitwan', coverImage: '/images/dest-chitwan.jpg' },
    { name: 'Thimphu', coverImage: '/images/dest-thimphu.jpg' },
    { name: 'Paro', coverImage: '/images/dest-paro.jpg' },
    { name: 'Punakha', coverImage: '/images/dest-punakha.jpg' },
    { name: 'Jodhpur', coverImage: '/images/dest-jodhpur.jpg' },
];

const makeTourFor = (categoryName, idx) => ({
    title: `${categoryName} Experience ${idx + 1}`,
    duration: `${5 + idx} Days / ${4 + idx} Nights`,
    location: categoryName,
    image: '/images/dest-rajasthan.jpg',
    overview: `A curated ${categoryName} itinerary showcasing highlights and local experiences.`,
    badge: 'Featured',
    price: 0,
    category: categoryName,
    cityName: categoryName
});

const run = async () => {
    try {
        await connectDB();

        for (const [i, cat] of categories.entries()) {
            const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            let existing = await DestinationCategory.findOne({ slug });
            if (!existing) {
                existing = await DestinationCategory.create({
                    name: cat.name,
                    tagline: `${cat.name} highlights`,
                    description: `Seeded category for ${cat.name}`,
                    coverImage: cat.coverImage,
                    order: i + 1,
                    status: 'Active'
                });
                console.log(`Created category: ${cat.name}`);
            } else {
                console.log(`Category exists: ${cat.name}`);
            }

            // Create 1 sample tour per category if none exist
            const tourCount = await Tour.countDocuments({ category: cat.name });
            if (tourCount === 0) {
                const t1 = makeTourFor(cat.name, 0);
                const t2 = makeTourFor(cat.name, 1);
                await Tour.create([t1, t2]);
                console.log(`Created sample tours for category: ${cat.name}`);
            } else {
                console.log(`Tours already present for category: ${cat.name}`);
            }
        }

        console.log('Categories and packages seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeder error:', err);
        process.exit(1);
    }
};

run();
