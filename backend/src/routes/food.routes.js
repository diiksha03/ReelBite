const express = require('express');
const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
});



router.post('/',
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("mama"),
    foodController.createFood
);



/* GET /api/food/ */
router.get("/",
    authMiddleware.authUserMiddleware,
    foodController.getFoodItems
);

/* POST /api/food/like */
router.post('/like',
    authMiddleware.authUserMiddleware,
    foodController.likeFood
);

/* POST /api/food/save-toggle */
router.post('/save-toggle',  
    authMiddleware.authUserMiddleware,
    foodController.saveFood
);

/* GET /api/food/saved-list */
router.get('/saved-list',   
    authMiddleware.authUserMiddleware,
    foodController.getSaveFood
);

module.exports = router;