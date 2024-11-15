const express = require('express');
const {
    getAllData,
    getDataById,
    createNewData,
    updateExistingData,
    deleteDataById,
} = require('../controllers/dataController');

const router = express.Router();

router.get('/data', getAllData);
router.get('/data/:id', getDataById);
router.post('/data', createNewData);
router.put('/data/:id', updateExistingData);
router.delete('/data/:id', deleteDataById);

module.exports = router;
