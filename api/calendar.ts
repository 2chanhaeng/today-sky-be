import { Router } from "express";
import calendar from "@/controller/calendar";
const route = Router();

route.get("/calendar/:todo_id", calendar.gets);

export default route;
