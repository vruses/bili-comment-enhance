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
    }
    // 检查是否是文件类型（图片）
    else if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
      // 获取文件并处理图片
      const file = items[i].getAsFile();
      // 上传图片
      const { code, data, message, ttl } = await uploadFile(file);

      const base64String = await getBase64FromFile(file);

      if (code !== 0) {
        console.warn(message);
        return;
      }
      // 设置图片数据
      setPicData(
        data.image_width,
        data.image_height,
        data.img_size,
        data.image_url,
        base64String,
        commentBox
      );
      // 显示图片区
      picturesUpload.style.display = "flex";
      // 更新图片区图片dom显示,源码分析hack得此api
      picturesUpload.update();
    }
  }
});

// 获取文件的base64编码
function getBase64FromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// 将数据交给picturesUpload和commentBox,一个用于显示一个准备上传给服务器
function setPicData(
  img_width,
  img_height,
  img_size,
  img_src,
  base64String,
  commentBox
) {
  const item = {
    data: {
      img_height,
      img_size,
      img_width,
      img_src,
    },
    msg: "",
    src: base64String,
    status: 1,
  };
  commentBox.picturesUpload.items.push(item);
  commentBox.pics.push(item.data);
}

// 获取cookie某个值
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].split("=");
    const cookieName = cookie[0].trim();
    if (cookieName === name) {
      return decodeURIComponent(cookie[1].trim());
    }
  }
  return null;
}

// 上传文件
function uploadFile(file) {
  const formData = new FormData();
  formData.append("file_up", file);
  formData.append("biz", "new_dyn");
  formData.append("category", "daily");
  formData.append("csrf", getCookie("bili_jct"));

  // 不用显式设置 Content-Type 头，浏览器会自动设置 multipart/form-data
  return fetch("https://api.bilibili.com/x/dynamic/feed/draw/upload_bfs", {
    method: "POST",
    headers: {
      Accept: "*/*",
    },
    credentials: "include",
    body: formData,
  }).then((response) => {
    return response.json();
  });
}
