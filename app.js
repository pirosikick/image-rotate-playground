const getAllTags = file => new Promise(resolve => {});
const readFileAsArrayBuffer = file =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      resolve(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  });

const renderOriginalImage = src => {
  const img = document.querySelector("#original-image");
  img.src = src;
  return img;
};

const waitImageLoaded = img =>
  new Promise(resolve => {
    img.onload = resolve;
  });

const renderExifTags = tags => {
  const output = document.querySelector("#exif-tags");
  output.innerHTML = "";

  Object.entries(tags).forEach(([key, value]) => {
    const dt = document.createElement("dt");
    dt.innerText = key;
    const dd = document.createElement("dd");
    dd.innerText = value;
    const dl = document.createElement("dl");
    dl.appendChild(dt);
    dl.appendChild(dd);

    output.appendChild(dl);
  });
};

const renderCanvas = (img, output) => {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  output = output || document.querySelector("#canvas-output");
  output.appendChild(canvas);
};

// https://misc.laboradian.com/html5/rotate-image-canvas-sample/001/
const TO_RADIANS = Math.PI / 180;

/**
 * https://misc.laboradian.com/html5/rotate-image-canvas-sample/001/
 * 回転させた画像を表示する
 * @param {object} image - Imageオブジェクト
 * @param {number} x - 画像の中心となるX座標
 * @param {number} y - 画像の中心となるY座標
 * @param {number} angle - 回転する角度[度]
 */
const drawRotatedImage = (context, image, x, y, angle) => {
  // コンテキストを保存する
  context.save();
  // 回転の中心に原点を移動する
  context.translate(x, y);
  // canvasを回転する
  context.rotate(angle * TO_RADIANS);
  // 画像サイズの半分だけずらして画像を描画する
  context.drawImage(
    image,
    -(image.width / 2),
    -(image.height / 2),
    image.width,
    image.height
  );
  // コンテキストを元に戻す
  context.restore();
};

const renderCanvasWithRotatation = (img, rotate90) => {
  if (!rotate90) {
    renderCanvas(img);
    return;
  }

  const [width, height] = [img.height, img.width];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  drawRotatedImage(ctx, img, width / 2, height / 2, 90);

  document.querySelector("#rotated-canvas-output").appendChild(canvas);
};

const onFile = async file => {
  const ab = await readFileAsArrayBuffer(file);
  const tags = EXIF.readFromBinaryFile(ab);
  renderExifTags(tags);

  const rotate90 = Number(tags.Orientation) === 6;
  console.log("rotate90", rotate90);

  const url = URL.createObjectURL(file);
  const img = renderOriginalImage(url);
  await waitImageLoaded(img);
  console.log(img.width, img.height);

  renderCanvas(img);
  renderCanvasWithRotatation(img, rotate90);
};

const onLoad = () => {
  const file = document.querySelector("#file");

  file.onchange = async e => {
    if (e.target.files[0]) {
      onFile(e.target.files[0]);
    }
  };
};

window.onload = onLoad;
