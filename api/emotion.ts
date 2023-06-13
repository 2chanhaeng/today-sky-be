import { Router } from "express";

import emotion from "@/controller/emotion";

const route = Router();
route.get("/analyze/:year/:month", emotion.getEmotion);

export default route;
