// Trước khi tạo MDC List phải chọn cái uncategorize
document.querySelectorAll('#cs-select-category li.mdc-list-item').forEach(category => {
  if (category.innerText === 'Uncategorized') {
    category.classList.add('mdc-list-item--selected');
    return;
  }
})

const categorySelect = new MDCSelect(document.querySelector('.mdc-select.cs-category-selecte'));
const txtUrlImg = document.querySelector('input[name="imgUrl"]');
const tagsInput = document.querySelector('input[name="tags-input"]');
const tags = document.querySelector('input[name="tags"]');
const imgPreview = document.querySelector('.cs-image-preview');
const chipSetEl = document.querySelector('.mdc-chip-set');
const chipSet = new MDCChipSet(chipSetEl);
const switchPublic = new MDCSwitch(document.querySelector('.mdc-switch'));
const isPublicGetted = document.querySelector('input[name="isPublicGetted"]');
let exit = true;

document.querySelector('form').addEventListener('submit', e => {
  if (categorySelect.value === "") {
    alert('Vui lòng chọn danh mục');
    e.preventDefault();
  }

  // Thêm tagid vào thẻ input tags
  var tagsListGl = [];
  chipSet.chips.forEach(chip => tagsListGl.push(chip.id));
  tags.value = tagsListGl.join(';');
  // Thoát mà không cảnh báo
  exit = false;
});

document.querySelector('form').addEventListener('keypress', e => {
  if (e.key === 'Enter' || e.keyCode === 13) {
    if (e.target.nodeName === 'TEXTAREA') { return; }
    e.preventDefault();
  }
})

txtUrlImg.addEventListener('keyup', e => {
  imgPreview.style.backgroundImage = "url(" + e.target.value + ")";
});

tagsInput.addEventListener('keyup', event => {
  if (event.key === 'Enter' || event.keyCode === 13) {
    if (chipSet.chips.length === 5) {
      alert('Bạn chỉ có thể nhập tối đa 5 thẻ vào bài viết!');
      return;
    }
    if (!/^[0-9a-zA-Z]+$/.test(event.target.value)) {
      alert('Không chứa kí tự đặc biệt, kí tự dấu, viết liền');
      return;
    }
    const userValue = event.target.value.toLowerCase();

    const check = chipSet.chips.find(chip => chip.id === userValue);
    if (check) {
      alert('Tag này đã tồn tại!');
      return;
    }

    addNewTag(userValue);
    event.target.value = '';
  }
});

if (tags.value) {
  const tagsList = tags.value.split(';');
  tagsList.forEach(tagId => {
    addNewTag(tagId);
  });
}

if (isPublicGetted) {
  switchPublic.checked = isPublicGetted.value;
}

function addNewTag(value) {
  var chipEl = document.createElement('div');
  chipEl.setAttribute('id', value);
  chipEl.className = 'mdc-chip';

  var chipElText = document.createElement('div');
  chipElText.className = 'mdc-chip__text';

  var cancelbutton = document.createElement('i');
  cancelbutton.className =
    'material-icons mdc-chip__icon mdc-chip__icon--trailing';
  cancelbutton.setAttribute('role', 'button');
  cancelbutton.setAttribute('tabindex', 0);
  cancelbutton.appendChild(document.createTextNode('cancel'));

  chipElText.appendChild(document.createTextNode(value));
  chipEl.append(chipElText, cancelbutton);

  chipSetEl.appendChild(chipEl);
  chipSet.addChip(chipEl);
}

window.onbeforeunload = function() {
  return exit ? 'Bạn có muốn rời khỏi trang này không?' : null;
}

// Chiều rộng của menu bằng chiều rộng của thằng select input
document.querySelector('#cs-select-category').style.width = 
  document.querySelector('#cs-select-category-input').scrollWidth + 'px';
