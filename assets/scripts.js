const $ = document.querySelector.bind(document);
const basicModal = new Kover({
    templateId: "basic-modal",
});

$("#open-basic-modal").onclick = () => {
    basicModal.open();
};
