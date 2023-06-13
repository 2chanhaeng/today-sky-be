import { Router } from "express";

import emotion from "@/controller/emotion";

const route = Router();
route.get("/gets", emotion.page);

export default route;
