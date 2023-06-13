const form = document.forms.feeling_form;
fillDiaryIfExist();
async function fillDiaryIfExist() {
  const apiUrl = getApiUrl();
  const res = await fetch(apiUrl);
  if (res.ok) {
    const data = await res.json();
    if (!data.content) return;
    console.log(data);
    form.feeling.value = data.emotion_id;
    form.diary_write.value = data.content;
    form.img.src = data.image;
  }
}

async function sendDiary() {
  const apiUrl = getApiUrl();
  fileUpload();
  const res = await axios({
    method: "POST",
    url: apiUrl,
    data: {
      emotion: Number(form.feeling.value),
      content: form.diary_write.value,
    },
  });
  console.log(res);
  window.location.href = window.location.pathname.substring(
    0,
    window.location.pathname.lastIndexOf("/")
  );
}

//이미지 파일 업로드 코드
async function fileUpload() {
  const formData = new FormData();
  const file = document.getElementById("upload");
  if (!file.files[0]) {
    return;
  }
  const uploadUrl = getUploadUrl();
  console.log(uploadUrl);
  formData.append("upload", file.files[0]);

  const res = await axios({
    method: "POST",
    url: uploadUrl,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return url;
}

//이미지 파일 미리보기 코드
function readURL(input) {
  if (input.files) {
    var reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("img").src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    document.getElementById("img").src = "";
  }
}

function getApiUrl() {
  const paths = window.location.pathname.split("/");
  paths.pop();
  paths.unshift("api");
  const apiUrl = "/" + paths.join("/");
  return apiUrl;
}

function getUploadUrl() {
  const paths = window.location.pathname.split("/").slice(2, -1);
  const apiUrl = "/" + ["api", "upload"].concat(paths).join("/");
  return apiUrl;
}
