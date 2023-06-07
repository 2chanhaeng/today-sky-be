import { Router } from "express";
import controller from "@/controller";
import diary from "./diary";
import todo from "./todo";
import todoComment from "./todoComment";
const route = Router();
// index route
route.get("/", controller.index);

// login route
route.get("/login", controller.loginPage);
route.post("/login", controller.login);

// signup route
route.get("/signup", controller.signupPage);
route.post("/signup", controller.signup);

// todo route
route.use("/todo", todo);

//todo comment route
route.use("/todo", todoComment);

// diary route
route.use("/diary", diary);

// todocalendar route
route.get("/todocalendar", controller.todoCalendar);

export default route;
