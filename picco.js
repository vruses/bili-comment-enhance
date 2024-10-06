const temp1 = document.querySelector("input");

temp1.addEventListener("paste", (event) => {
  // 获取剪贴板中的项目
  const items = (event.clipboardData || window.clipboardData).items;

  // 遍历所有的剪贴板数据项
  for (let i = 0; i < items.length; i++) {
    // 检查是否是文本类型
    if (items[i].kind === "string") {
      // 读取文本数据
      items[i].getAsString((text) => {
        console.log("粘贴的文本:", text);
      });
    }
    // 检查是否是文件类型（例如图片）
    else if (items[i].kind === "file") {
      const file = items[i].getAsFile();
      // 如果是图片，可以展示图片（可选）
      if (file.type.startsWith("image/")) {
        console.log("粘贴的图片:", file);
        const reader = new FileReader();
        // 读取文件作为Data URL（即base64编码）
        reader.onload = function (e) {
          const base64String = e.target.result;
          console.log("粘贴的图片的base64编码:", base64String);

          // 创建Image对象获取图片的宽度和高度
          const img = new Image();
          img.onload = function () {
            console.log("图片宽度:", img.width);
            console.log("图片高度:", img.height);

            // 可选：展示图片
            document.body.appendChild(img);
          };
          img.src = base64String;
        };
        reader.readAsDataURL(file); // 将文件读取为base64编码
      }
    }
  }
});
