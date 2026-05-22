const $ = document.querySelector.bind(document);
const basicModal = new Kover({
    templateId: "basic-modal",
    // content: "<h1>New content</h1>",
});

$("#open-basic-modal").onclick = () => {
    basicModal.open();
};

basicModal.open();
