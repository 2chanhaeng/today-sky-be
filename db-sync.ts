import db from "@/models";

sync();

async function sync() {
  const result = await db.sequelize.sync({ force: true });
  const schemas = result.showAllSchemas({});
  console.log(await schemas);
  [
    { id: 1, feel: "happy" },
    { id: 2, feel: "good" },
    { id: 3, feel: "soso" },
    { id: 4, feel: "not_bad" },
    { id: 5, feel: "bad" },
  ].forEach(async (emotion) => {
    const [result, iscreated] = await db.emotion.upsert(emotion);
    result?.save();
  });
}
