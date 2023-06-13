import { Router } from "express";
import diary from "./diary";
import todo from "./todo";
import upload from "./upload";
import calendar from "./calendar";
import emotion from "./emotion";
import signup from "./signup";

const route = Router();

route.use("/diary", diary);
route.use("/todo", todo);
route.use("/upload", upload);
route.use("/calendar", calendar);
route.use("/emotion", emotion);
route.use("/signup", signup);

export default route;
