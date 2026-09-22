#!/usr/bin/env node
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import DestinationCategory from '../src/models/DestinationCategory.js';
import City from '../src/models/City.js';

dotenv.config();

const cities = [
    { name: 'Delhi', state: 'Delhi', bannerImage: '/images/dest-delhi.jpg' },
    { name: 'Agra', state: 'Uttar Pradesh', bannerImage: '/images/dest-agra.jpg' },
    { name: 'Varanasi', state: 'Uttar Pradesh', bannerImage: '/images/dest-varanasi.jpg' },
    { name: 'Amritsar', state: 'Punjab', bannerImage: '/images/dest-amritsar.jpg' },
    { name: 'Dharamsala', state: 'Himachal Pradesh', bannerImage: '/images/dest-dharamsala.jpg' },
    { name: 'Rishikesh', state: 'Uttarakhand', bannerImage: '/images/dest-rishikesh.jpg' },
    { name: 'Ladakh', state: 'Ladakh', bannerImage: '/images/dest-ladakh.jpg' },
    { name: 'Kerala', state: 'Kerala', bannerImage: '/images/dest-kerala.jpg' },
    { name: 'Tamil Nadu', state: 'Tamil Nadu', bannerImage: '/images/dest-tamilnadu.jpg' },
    { name: 'Karnataka', state: 'Karnataka', bannerImage: '/images/dest-karnataka.jpg' },
    { name: 'Gujarat', state: 'Gujarat', bannerImage: '/images/dest-gujarat.jpg' },
    { name: 'Orissa', state: 'Odisha', bannerImage: '/images/dest-orissa.jpg' },
    { name: 'Kathmandu', state: 'Bagmati', bannerImage: '/images/dest-kathmandu.jpg' },
    { name: 'Chitwan', state: 'Bagmati', bannerImage: '/images/dest-chitwan.jpg' },
    { name: 'Thimphu', state: 'Thimphu', bannerImage: '/images/dest-thimphu.jpg' },
    { name: 'Paro', state: 'Paro', bannerImage: '/images/dest-paro.jpg' },
    { name: 'Punakha', state: 'Punakha', bannerImage: '/images/dest-punakha.jpg' },
    { name: 'Jodhpur', state: 'Rajasthan', bannerImage: '/images/dest-jodhpur.jpg' }
];

const run = async () => {
    try {
        await connectDB();

        for (const c of cities) {
            const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // Ensure a destination category exists for this city (fall back to creating one)
            let category = await DestinationCategory.findOne({ slug });
            if (!category) {
                category = await DestinationCategory.create({
                    name: c.name,
                    tagline: `${c.name} highlights`,
                    description: `Seeded destination for ${c.name}`,
                    coverImage: c.bannerImage,
                    order: 10,
                    status: 'Active'
                });
                console.log(`Created destination category for city: ${c.name}`);
            } else {
                console.log(`Found category for: ${c.name}`);
            }

            // Create city document if not exists
            const existingCity = await City.findOne({ slug });
            if (existingCity) {
                console.log(`City already exists: ${c.name}`);
                continue;
            }

            await City.create({
                name: c.name,
                categoryId: category._id,
                categoryName: category.name,
                state: c.state || category.name,
                tagline: `${c.name} - Explore with us`,
                heroTitle: `${c.name} Tours & Packages`,
                metaTitle: `${c.name} travel guide`,
                metaDescription: `Discover ${c.name} with curated tours and experiences.`,
                bannerImage: c.bannerImage,
                gallery: [c.bannerImage],
                highlights: ['Top attractions', 'Local experiences'],
                packagesCount: 0,
                featured: false,
                status: 'Published'
            });

            console.log(`Inserted city: ${c.name}`);
        }

        console.log('City seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeder error:', err);
        process.exit(1);
    }
};

run();
