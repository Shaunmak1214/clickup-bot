const express = require('express');
const router = express.Router();

const { daily } = require('../controllers')

router
    .route('/')
    .get(daily.getDailyTasks)

module.exports = router;