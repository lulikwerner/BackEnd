import mongoose from 'mongoose';

import User from '../src/dao/mongo/models/users.js'; // Import your User model


mongoose.connect('mongodb+srv://lulikwerner:123@clustercitofeliz.ro8b1xi.mongodb.net/ecommerce?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    readPreference: 'primary', // Specify primary read preference
});

const connection = mongoose.connection;

connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

(async () => {
    try {
        const users = await User.find({}); // Fetch all existing users

        for (const user of users) {
            if (!user.last_connection) {
                user.last_connection = Date.now();
                // Save the updated user back to the collection
                try {
                    await user.save();
                } catch (error) {
                    console.error('Error during user update:', error);
                }
            }
        }

        console.log('Migration complete.');
        console.log(users)
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        mongoose.disconnect();
        console.log('Disconnected explicitly from MongoDB');
    }
})();
