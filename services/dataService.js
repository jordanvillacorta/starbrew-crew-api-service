const { DataModel } = require('../models');

/**
 * Fetch all records from the database.
 * @returns {Promise<Array>} An array of all records in the database.
 */

const fetchAllData = async () => {
    try {
        const records = await DataModel.findAll();
        return records;
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
};

/**
 * Fetch a specific record by its ID.
 * @param {number} id - The ID of the record to fetch.
 * @returns {Promise<Object|null>} The record if found, otherwise null.
 */

const fetchDataById = async (id) => {
    try {
        const record = await DataModel.findByPk(id);
        return record;
    } catch (error) {
        throw new Error(`Error fetching data by ID (${id}): ${error.message}`);
    }
};

/**
 * Create a new record in the database.
 * @param {Object} data - The data to insert as a new record.
 * @returns {Promise<Object>} The newly created record.
 */

const createData = async (data) => {
    try {
        const newRecord = await DataModel.create(data);
        return newRecord;
    } catch (error) {
        throw new Error(`Error creating data: ${error.message}`);
    }
};

/**
 * Update an existing record by its ID.
 * @param {number} id - The ID of the record to update.
 * @param {Object} newData - The updated data for the record.
 * @returns {Promise<Object|null>} The updated record, or null if not found.
 */

const updateData = async (id, newData) => {
    try {
        const record = await DataModel.findByPk(id);

        if (!record) {
            return null; // Record not found
        }

        const updatedRecord = await record.update(newData);
        return updatedRecord;
    } catch (error) {
        throw new Error(`Error updating data with ID (${id}): ${error.message}`);
    }
};

/**
 * Delete a record by its ID.
 * @param {number} id - The ID of the record to delete.
 * @returns {Promise<boolean>} True if the record was deleted, false otherwise.
 */

const deleteData = async (id) => {
    try {
        const record = await DataModel.findByPk(id);

        if (!record) {
            return false; // Record not found
        }

        await record.destroy();
        return true; // Successfully deleted
    } catch (error) {
        throw new Error(`Error deleting data with ID (${id}): ${error.message}`);
    }
};

/**
 * Query records based on custom filters.
 * @param {Object} filters - The filters to apply (e.g., { field: value }).
 * @returns {Promise<Array>} An array of filtered records.
 */

const queryData = async (filters) => {
    try {
        const records = await DataModel.findAll({ where: filters });
        return records;
    } catch (error) {
        throw new Error(`Error querying data with filters: ${JSON.stringify(filters)}, ${error.message}`);
    }
};

module.exports = {
    fetchAllData,
    fetchDataById,
    createData,
    updateData,
    deleteData,
    queryData,
};
