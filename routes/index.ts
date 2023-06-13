import { Router } from "express";
import controller from "@/controller";
import diary from "./diary";
import todo from "./todo";
import emotion from "./emotion";

const route = Router();

// index route
route.get("/", controller.index);

// login route
route.get("/login", controller.loginPage);
route.post("/login", controller.login);
// logout route
route.get("/logout", controller.logout);
// signup route
route.get("/signup", controller.signupPage);
route.post("/signup", controller.signup);

// todo route
route.use("/todo", todo);

// diary route
route.use("/diary", diary);

route.get("/todo-zh", (req, res) => res.render("todo-zh"));

route.get("/startpage", function (req, res) {
  res.render("startpage");
});

//emotion route
route.use("/emotion", emotion);

// profile route
route.get("/profile", controller.profile);

export default route;
