const express = require("express")
 const router = express.Router();
const TrainRepository = require("./train.repository")
const TrainService = require("./train.service")
const TrainController = require("./train.controller")

const trainRepository = new TrainRepository();
const trainService = new TrainService(trainRepository);
const trainController = new TrainController(trainService)

router.get("/trains",trainController.searchTrain)

module.exports = router;