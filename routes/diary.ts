import { Router } from "express";
import diary from "@/controller/diary";

const route = Router();

route.get("/main", diary.main);
route.get("/timeline", diary.timeline);
route.get("/:year/:month/:date/write", diary.write);
route.get("/:year/:month/:date", diary.daily);
route.get("/:year/:month", diary.monthly);
route.get("*", diary.redirectMonthly);

export default route;
