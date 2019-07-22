const tagsChipSet = new MDCChipSet(document.querySelector('.mdc-chip-set'));

const dialogListPostHTML = document.querySelector('#dialog-list-post');
const dialogListPost = new MDCDialog(dialogListPostHTML);
dialogListPost.scrimClickAction = '';
dialogListPost.escapeKeyAction = '';

document.querySelector('#btn-list-post').addEventListener('click', () => {
  dialogListPost.open();
});