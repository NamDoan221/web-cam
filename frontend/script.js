let camera_button = document.querySelector("#start-camera");
let camera_button_stop = document.querySelector("#stop-camera");
let video = document.querySelector("#video");
let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");
let download_link = document.querySelector("#download-video");

let camera_stream = null;
let media_recorder = null;
let blobs_recorded = [];

camera_button.addEventListener("click", async function () {
  camera_stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  video.srcObject = camera_stream;
});

camera_button_stop.addEventListener("click", async function () {
  let stream = video.srcObject;
  let tracks = stream.getTracks();
  for (let i = 0; i < tracks.length; i++) {
    let track = tracks[i];
    track.stop();
  }
  video.srcObject = null;
});

start_button.addEventListener("click", function () {
  media_recorder = new MediaRecorder(camera_stream, { mimeType: "video/webm" });
  let image_number = 0;
  media_recorder.addEventListener("dataavailable", function (e) {
    const canvas = document.createElement("canvas");
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL("image/jpeg");
    const file = dataURLtoFile(image_data_url, `image_${image_number}.jpeg`);
    image_number++;
    const form_data = new FormData();
    form_data.append("file", file);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:3000/uploadfile");
    xhr.send(form_data);
    blobs_recorded.push(e.data);
  });

  media_recorder.addEventListener("stop", function () {
    let video_local = URL.createObjectURL(
      new Blob(blobs_recorded, { type: "video/webm" })
    );
    download_link.href = video_local;
  });
  media_recorder.start(1000);
});

stop_button.addEventListener("click", function () {
  media_recorder.stop();
});

function dataURLtoFile(dataUrl, filename) {
  const arr = dataUrl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
