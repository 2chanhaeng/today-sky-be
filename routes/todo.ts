import { Router } from "express";
import todo from "@/controller/todo";

const route = Router();
route.get("/timeline", todo.timeline);
route.get("/calendar", todo.calendar);
route.get("/:year/:month/:date", todo.daily);
route.get("/:year/:month", todo.monthly);
route.get("*", todo.redirectMonthly);

export default route;
