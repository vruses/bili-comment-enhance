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
  // 多个上传图片任务
  const uploadTasks = [];
  // 遍历所有的剪贴板数据项（一个数据项可能包含多张图片）
  for (let i = 0; i < items.length; i++) {
    // 检查是否是文本类型
    if (items[i].kind === "string") {
    }
    // 检查是否是文件类型（图片）
    else if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
      // 获取文件并处理图片
      const file = items[i].getAsFile();
      // 显示图片区
      picturesUpload.style.display = "flex";
      // 初始化图片显示并拿到图片对象方便修改数据
      const taskItem = initPicData(commentBox);
      // 分割每份上传任务避免阻塞
      uploadTasks.push(taskTemplate(taskItem, file, commentBox));
    }
  }
  await Promise.all(uploadTasks);
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
function initPicData(commentBox) {
  const item = {
    data: {},
    msg: "",
    src: "",
    // 根据status决定图片显示,0为初始化，1正常显示，2显示上传失败
    status: 0,
  };
  commentBox.picturesUpload.items.push(item);
  commentBox.pics.push(item.data);
  return item;
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
  })
    .then((response) => {
      return response.json();
    })
    .catch((reason) => {
      // 网络问题上传失败或者返回0以外的code需要显示图片上传失败
      console.log(reason);
      return { code: -1 };
    });
}

// 每个文件上传到返回响应结果后的流程
async function taskTemplate(taskItem, file, commentBox) {
  // 图片本地上传后更新显示
  const base64String = await getBase64FromFile(file);
  taskItem.src = base64String;
  // hack源码得到的api，修改属性数据时调用更新
  commentBox.picturesUpload.update();

  // 图片上传服务器后更新显示和状态
  const res = await uploadFile(file);
  if (res.code >= 0) {
    const fileInfo = res.data;
    taskItem.data.img_size = fileInfo.img_size;
    taskItem.data.img_width = fileInfo.image_width;
    taskItem.data.img_height = fileInfo.image_height;
    taskItem.data.img_src = fileInfo.image_url;
  }
  taskItem.status = res.code === 0 ? 1 : 2;
  // 响应结果后再次更新
  commentBox.picturesUpload.update();
  commentBox.update();
}
