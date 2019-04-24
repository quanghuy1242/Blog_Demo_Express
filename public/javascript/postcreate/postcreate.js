var categorySelect = new MDCSelect(document.querySelector('.mdc-select.cs-category-selecte'));
document.querySelector('form').addEventListener('submit', function(e) {
  if (categorySelect.value === "") {
    alert('Vui lòng chọn danh mục');
    e.preventDefault();
  }
})