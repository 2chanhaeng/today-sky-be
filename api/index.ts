import { Router } from "express";
import diary from "./diary";
import todo from "./todo";
import upload from "./upload";
import signup from "./signup";
import login from "./login";

const route = Router();

route.use("/diary", diary);
route.use("/todo", todo);
route.use("/upload", upload);
route.use("/signup", signup);
route.use("/login", login);

export default route;
