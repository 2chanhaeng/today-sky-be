import { Router } from "express";
import todo from "@/controller/todo";
import comment from "./comment";

const route = Router();

// comment
route.use("/comment", comment);

// todo
route.post("/:year/:month/:date", todo.post);
route.get("/:year/:month/:date", todo.get);
route.get("/:year/:month/", todo.gets);
route.delete("/:year/:month/:date", todo.destroyAll);
route.put("/:id", todo.put);
route.patch("/:id", todo.patch);
route.delete("/:id", todo.destroy);

export default route;
