const { fetchAllData, fetchDataById, createData, updateData, deleteData } = require('../services/dataService');
const { handleError } = require('../utils/errorHandler');

/**
 * Get all data
 */
const getAllData = async (req, res) => {
    try {
        const data = await fetchAllData();
        res.status(200).json({ success: true, data });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Get data by ID
 */
const getDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fetchDataById(id);

        if (!data) {
            return handleError(res, new Error('Data not found'), 404);
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Create new data
 */
const createNewData = async (req, res) => {
    try {
        const newData = await createData(req.body);
        res.status(201).json({ success: true, data: newData });
    } catch (error) {
        handleError(res, error, 400); // Assume bad request for validation errors
    }
};

/**
 * Update existing data by ID
 */
const updateExistingData = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = await updateData(id, req.body);

        if (!updatedData) {
            return handleError(res, new Error('Data not found for update'), 404);
        }

        res.status(200).json({ success: true, data: updatedData });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Delete data by ID
 */
const deleteDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteData(id);

        if (!deleted) {
            return handleError(res, new Error('Data not found for deletion'), 404);
        }

        res.status(200).json({ success: true, message: 'Data deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
};

module.exports = {
    getAllData,
    getDataById,
    createNewData,
    updateExistingData,
    deleteDataById,
};
