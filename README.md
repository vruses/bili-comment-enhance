# bili 评论功能增强

## 使用场景

截图后不需要额外保存，文件夹选中多张图片复制，微信等软件的聊天框中仅存在一张图片时复制，然后粘贴到评论框而不需要麻烦的上传图片。

## 想图文一起复制粘贴怎么办

目前不可行，以 windows 为例子，操作系统本身内置了一些类型，叫“标准剪贴板格式”。这些标准格式里确实只支持单一的格式，比如要么文本、要么图片。但是：
图文混排的富文本的话一般会转成 HTML 或者 RTF 之类的结构，就可以当纯文本读写了，然后接收端需要自己解析取得的内容。比如从网页上复制一大段内容、粘贴到 Word 里、会发现它还带着样式，就是这种。
操作系统还提供了 RegisterClipboardFormat 这样的 API，可以自己注册自己的自定义格式。
所以只支持一些简单的图片复制，像微信 qq 和 word 的图文复制都是需要客户端解析的。
（其实HTML的图文复制格式clipboardAPI倒是支持，但是图文上传不仅仅是粘贴html这么简单。）

## 原理

clipboard.item有两个属性：
- kind：用于快速区分数据的基本类型（字符串或文件）。这对于初步判断数据的处理方式非常有用。
- type: 属性提供了更详细的 MIME 类型信息，用于确定具体的数据格式。包括html等格式。

