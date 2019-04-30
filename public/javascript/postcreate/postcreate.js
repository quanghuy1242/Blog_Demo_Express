var categorySelect = new MDCSelect(document.querySelector('.mdc-select.cs-category-selecte'));
var txtUrlImg = document.querySelector('input[name="imgUrl"]');
var tagsInput = document.querySelector('input[name="tags-input"]');
var tags = document.querySelector('input[name="tags"]');
var imgPreview = document.querySelector('.cs-image-preview');
var chipSetEl = document.querySelector('.mdc-chip-set');
var chipSet = new MDCChipSet(chipSetEl);
var switchPublic = new MDCSwitch(document.querySelector('.mdc-switch'));
var isPublicGetted = document.querySelector('input[name="isPublicGetted"]');
var exit = true;

document.querySelector('form').addEventListener('submit', function(e) {
  if (categorySelect.value === "") {
    alert('Vui lòng chọn danh mục');
    e.preventDefault();
  }

  // Thêm tagid vào thẻ input tags
  var tagsListGl = [];
  chipSet.chips.forEach(function(chip) {
    tagsListGl.push(chip.id);
  });
  tags.value = tagsListGl.join(';');
  // Thoát mà không cảnh báo
  exit = false;
});

document.querySelector('form').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    if (e.target.nodeName === 'TEXTAREA') { return; }
    e.preventDefault();
  }
})

txtUrlImg.addEventListener('keyup', function(e) {
  imgPreview.style.backgroundImage = "url(" + e.target.value + ")";
});

tagsInput.addEventListener('keyup', function(event) {
  if (event.key === 'Enter' || event.keyCode === 13) {
    if (chipSet.chips.length === 5) {
      alert('Bạn chỉ có thể nhập tối đa 5 thẻ vào bài viết!');
      return;
    }
    if (!/^[0-9a-zA-Z]+$/.test(event.target.value)) {
      alert('Không chứa kí tự đặc biệt, kí tự dấu, viết liền');
      return;
    }
    var userValue = event.target.value.toLowerCase();

    var check = chipSet.chips.find(function(chip) {
      return chip.id === userValue;
    });
    if (check) {
      alert('Tag này đã tồn tại!');
      return;
    }

    addNewTag(userValue);
    event.target.value = '';
  }
});

if (tags.value) {
  var tagsList = tags.value.split(';');
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