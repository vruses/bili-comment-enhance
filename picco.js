// 获取评论区盒子及其内部的文字、图片输入区
const commentBox = document
  .querySelector("#commentapp > bili-comments")
  .shadowRoot.querySelector("#header > bili-comments-header-renderer")
  .shadowRoot.querySelector("#commentbox > bili-comment-box");
const richTextarea = commentBox.richTextarea;
const picturesUpload = commentBox.picturesUpload;
const inputarea = richTextarea.brt.editor;
inputarea.addEventListener("paste", async (event) => {
  // 获取剪贴板中的项目
  const items = (event.clipboardData || navigator.clipboardData).items;

  // 遍历所有的剪贴板数据项（一个数据项可能包含多张图片）
  for (let i = 0; i < items.length; i++) {
    // 检查是否是文本类型
    if (items[i].kind === "string") {
      // 读取文本数据
      const text = await getStringFromItem(items[i]);
      console.log("粘贴的文本:", text);
    }
    // 检查是否是文件类型（图片）
    else if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
      // 获取文件并处理图片
      const file = items[i].getAsFile();
      const size = file.size;
      console.log("图片大小 (bytes):", file.size); // 获取文件大小
      const base64String = await getBase64FromFile(file);
      console.log("粘贴的图片的base64编码:", base64String);

      const { width, height } = await getImageDimensions(base64String);
      console.log("图片宽度:", width);
      console.log("图片高度:", height);

      // 设置图片数据
      setPicData(width, height, size, base64String, picturesUpload);
      // 显示图片区
      picturesUpload.style.display = "flex";
      // 更新图片区图片dom显示,源码分析hack得此api
      picturesUpload.update();
    }
  }
});
// 获取文本数据
function getStringFromItem(item) {
  return new Promise((resolve) => {
    item.getAsString((text) => resolve(text));
  });
}

// 获取文件的base64编码
function getBase64FromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// 获取图片的宽度和高度
function getImageDimensions(base64String) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = base64String;
  });
}

// 将数据交给picturesUpload
function setPicData(img_width, img_height, img_size, base64, target) {
  const item = {
    data: {
      img_height,
      img_size,
      img_width,
      img_src: "",
    },
    msg: "",
    src: base64,
    status: 1,
  };
  target.items.push(item);
}
