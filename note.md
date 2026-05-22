# content

content: "<h1>abc</h1>"

khi truyền cả templatId và content thì ưu tiên content để hiển thị

const modal1 = new Modal({
templateId: "modal-1",
content: "<h1>New content</h1>"
})

function Modal(options = {}) {
this.opt = Object.assign({

    }, options)

}
