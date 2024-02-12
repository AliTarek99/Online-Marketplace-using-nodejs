const removeProduct = (btn, prodId) => {
    const productElement = btn.closest('article');
    fetch(`/admin/delete-product/${prodId}`, {method: 'DELETE'})
    .then(result => {
        return result.json();
      })
      .then(data => {
        if(data.successful)
            productElement.parentNode.removeChild(productElement);
      })
      .catch(err => {
        console.log(err);
      });
}