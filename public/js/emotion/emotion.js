const ctx = document.getElementById("myChart");
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;

axios({
  method: "GET",
  url: `/api/emotion/analyze/${year}/${month}`,
}).then((res) => {
  console.log(res.data);
  new Chart(ctx, {
    type: "polarArea",
    data: {
      labels: ["Happy", "Good", "Soso", "Notbad", "Bad"],
      datasets: [
        {
          label: "# of Votes",
          data: [
            res.data.emotion.Happy,
            res.data.emotion.Good,
            res.data.emotion.Soso,
            res.data.emotion.Notbad,
            res.data.emotion.Bad,
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        customCanvasBackgroundColor: {
          color: "#A8CCE7",
        },
      },
      scales: {
        y: {
          // defining min and max so hiding the dataset does not change scale range
          min: 0,
          max: 100,
        },
      },
    },
    plugins: [plugin],
  });
});
const plugin = {
  id: "customCanvasBackgroundColor",
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = options.color || "#A8CCE7";
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};
