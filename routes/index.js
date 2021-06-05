const express = require('express');
const router = express.Router();

const dailyRoute = require('./daily.route');

const defaultRoutes = [
    {
        path: '/daily',
        route: dailyRoute
    },
]

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;