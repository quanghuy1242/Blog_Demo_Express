//#region Khai báo
var btnAdd = document.querySelector('#btnAdd');
var btnUpdate = document.querySelector('#btnUpdate');
var btnDelete = document.querySelector('#btnDelete');
var btnRefresh = document.querySelector('#btnRefresh');

var isAdd = false;
var listCategoriesHTML = document.querySelector('#list-category');

var hostName = window.location.protocol + '//' + window.location.host

var txtNameId = new MDCTextField(document.querySelector('#txtNameID.mdc-text-field'));
var txtName = new MDCTextField(document.querySelector('#txtName.mdc-text-field'));
var txtUrlImage = new MDCTextField(document.querySelector('#txtUrlImage.mdc-text-field'));
var txtDescription = new MDCTextField(document.querySelector('#txtDesription.mdc-text-field'));

// Item đang được click, find() trả về phần tử đầu tiên tìm thấy
var selectedItem = null;

// List 
var listCategories = new MDCList(listCategoriesHTML);
listCategories.listElements.map(function(element) {
  new MDCRipple(element);
});
//#endregion

//#region Đăng kí xự kiện
// Nút thêm mới một danh mục
btnAdd.addEventListener('click', function() {
  btnUpdate.innerText = "Thêm";
  clear();
  isAdd = true;
});

// Nút cập nhật/thêm một danh mục
btnUpdate.addEventListener('click', function() {
  if (isAdd) { // Add new category
    if (!txtNameId.value || !txtName.value || !txtUrlImage.value || !txtDescription.value) {
      alert('Bạn không thể bỏ trống trường nào!');
      return;
    }
    // Post lên
    axios.post(hostName + '/api/category', {
      nameId: txtNameId.value,
      name: txtName.value,
      urlImage: txtUrlImage.value,
      description: txtDescription.value
    }).then(function(res) {
      // Trả lại nút cập nhật
      btnUpdate.innerText = "Cập nhật";
      isAdd = false;
      // Hiện thị li đó ra màn hình
      renderListItem(txtNameId.value, txtName.value, txtDescription.value); // render to screen
      // click vô li vừa được thêm
      listCategoriesHTML.childNodes[listCategoriesHTML.childElementCount - 1].click();
      alert('Thành công');
    }).catch(function(err) {
      alert('Đã xảy ra một lỗi');
      console.log(err);
    }) 
  } else { // Update exist category
    // Kiểm tra dữ liệu
    if (!txtNameId.value || !txtName.value || !txtUrlImage.value || !txtDescription.value) {
      alert('Bạn không thể bỏ trống trường nào!');
      return;
    }
    // li đang được click
    selectedItem = Array.from(listCategoriesHTML.childNodes).find(
      li => Array.from(li.classList).includes('mdc-list-item--selected')
    );
    // Cái nào đang được click?
    var nameId = selectedItem.getAttribute('data-nameId');
    // put lên
    axios.put(hostName + '/api/category/' + nameId, {
      name: txtName.value,
      urlImage: txtUrlImage.value,
      description: txtDescription.value
    }).then(res => {
      alert("Cập nhật thành công!");
      console.log(res);
    }).catch(err => {
      alert("Có lỗi xảy ra");
      console.log(err);
    })
  }
})

// Xoá một danh mục
btnDelete.addEventListener('click', () => {
  if (confirm('Bạn có chắc chắn xoá mục này đi không?')) {
    // li đang được click
    selectedItem = Array.from(listCategoriesHTML.childNodes).find(li =>
      Array.from(li.classList).includes('mdc-list-item--selected')
    );
    // Cái nào đang được click?
    var nameId = selectedItem.getAttribute('data-nameId');
    // delete nó !!!
    axios
      .delete(hostName + '/api/category/' + nameId)
      .then(res => {
        // Vị trí của nó
        var selectedIndex = listCategories.listElements.indexOf(selectedItem);
        // Xoá nó khỏi DOM
        listCategoriesHTML.removeChild(selectedItem);
        // click vào cái thằng trên nó
        listCategoriesHTML.childNodes[selectedIndex - 1].click();
        alert('Xoá thành công!');
        console.log(res);
      })
      .catch(err => {
        alert('Có lỗi xảy ra');
        console.log(err);
      });
  }
});

// Tải lại danh sách danh mục
btnRefresh.addEventListener('click', () => {
  listCategoriesHTML.innerHTML = ""; // Xoá toàn bộ những gì đang có
  loadDSCategory(); // Lấy cái mới
})

// Khi chọn một danh mục ở mdc list
listCategories.listen('MDCList:action', function(e) {
  const nameId = e.target.childNodes[e.detail.index].getAttribute('data-nameId');

  // Toggle class: xoá hết cái đang chọn và chọn cái được click
  listCategoriesHTML.childNodes.forEach(items => {
    items.classList.remove('mdc-list-item--selected');
  })
  e.target.childNodes[e.detail.index].classList.toggle('mdc-list-item--selected');

  // Lấy dữ liệu từ database
  axios.get(hostName + '/api/category/' + nameId)
    .then(function(res) {
      const category = res.data.category;
      // bind dữ liệu vào text input
      txtNameId.value = category.nameId;
      txtName.value = category.name;
      txtUrlImage.value = category.urlImage;
      txtDescription.value = category.description;
      // Lỡ mà đang bấm nút thêm thì chuyển lại thành nút cập nhật
      isAdd = false;
      btnUpdate.innerText = "Cập nhật";
    })
    .catch(function(err) {
      alert('Có lỗi');
    })
})

// load danh sách danh mục
window.onload = () => {
  loadDSCategory();
};
//#endregion

//#region util
// Xoá rỗng
function clear() {
  txtNameId.value = "";
  txtName.value = "";
  txtUrlImage.value = "";
  txtDescription.value = "";
}

// Thêm li item mới vào mdc list
function addNewItemsToList(item) {
  // Không cần dòng này, mdc tự động thêm khi cái mới được render
  // listCategories.listElements.push(item); 
  new MDCRipple(item);
}

function loadDSCategory() {
  axios.get(hostName + '/api/categories').then(function(res) {
    const categories = res.data.categories;
    // Sau khi lấy được danh sách thì render chúng ra màn hình
    categories.forEach(function(category) {
      renderListItem(category.nameId, category.name, category.description);
    });
    // Chọn li cái đầu tiên
    listCategoriesHTML.firstChild.classList.add('mdc-list-item--selected');
    listCategoriesHTML.childNodes[0].click();
  });
}
//#endregion

//#region Render content
// Render function
function renderListItem(nameId, name, description) {
  var liListItem = document.createElement('li');
  liListItem.className = 'mdc-list-item';
  liListItem.setAttribute('data-nameId', nameId);

  var spanListText = document.createElement('span');
  spanListText.className = 'mdc-list-item__text';

  var spanPrimaryText = document.createElement('span');
  spanPrimaryText.className = 'mdc-list-item__primary-text';
  spanPrimaryText.appendChild(document.createTextNode(name));
  
  var spanSecondaryText = document.createElement('span');
  spanSecondaryText.className = 'mdc-list-item__secondary-text';
  spanSecondaryText.appendChild(document.createTextNode(description));

  liListItem.appendChild(spanListText);
  spanListText.append(spanPrimaryText, spanSecondaryText);

  listCategoriesHTML.appendChild(liListItem);

  // Thêm li đó vào mdc list
  addNewItemsToList(liListItem);
}
//#endregion