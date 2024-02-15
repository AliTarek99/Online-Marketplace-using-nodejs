const addToCart = prodId => {
  fetch(`/add-to-cart/${prodId}`, {method: 'PATCH'})
  .then(result => {
    return result.json();
  })
  .then(data => {
    if(!data.successful) {
        alert(data.message);
    }
  })
  .catch(err => {
    console.log(err);
  });
}

const removeFromCart = (btn, prodId) => {
  const productElement = btn.closest('li');
  const cartElement = document.getElementById('cart');
  const totalObject = document.querySelector('h3#total');
  const total = totalObject.textContent;
  const empty = document.getElementById('empty');

  productElement.hidden = !productElement.hidden;

  fetch(`/remove-from-cart/${prodId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type':'application/x-www-form-urlencoded'
    },
    body: `total=${total}`
  })
  .then(result => {
    return result.json();
  })
  .then(data => {
    if(data.successful) {
      if(data.empty) {
        cartElement.remove();
        empty.hidden = !empty.hidden;
      }
      productElement.parentNode.removeChild(productElement);
      totalObject.textContent = data.total;
    }
    else {
      productElement.hidden = !productElement.hidden;
    }
  })
  .catch(err => {
    productElement.hidden = !productElement.hidden;
    console.log(err);
  });
}