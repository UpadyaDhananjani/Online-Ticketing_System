// server/controllers/publicController.js
import User from '../models/userModel.js'; // Import User model if you want to derive units from it

// Get all units (publicly accessible)
// RENAMED: getUnits -> getPublicUnits to match import in publicRoutes.js
export const getPublicUnits = async (req, res) => {
    try {
        // This should match the hardcoded list in your User model's enum and admin controller
        const units = [
            { _id: 'System and Network Administration', name: 'System and Network Administration' },
            { _id: 'Asyhub Unit', name: 'Asyhub Unit' },
            { _id: 'Statistics Unit', name: 'Statistics Unit' },
            { _id: 'Audit Unit', name: 'Audit Unit' },
            { _id: 'Helpdesk Unit', name: 'Helpdesk Unit' },
            { _id: 'Functional Unit', name: 'Functional Unit' },
        ];
        res.json(units);

        // If you ever want to derive units dynamically from your User model:
        /*
        const distinctUnits = await User.distinct('unit');
        const units = distinctUnits.map(unit => ({ _id: unit, name: unit }));
        res.json(units);
        */

    } catch (error) {
        console.error("Public Get Units Error:", error);
        res.status(500).json({ message: 'Error fetching units', error: error.message });
    }
};