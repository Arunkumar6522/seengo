$(document).ready(function() {
  // Inject Auth Modal if it doesn't exist
  if ($('#authOverlay').length === 0) {
    const modalHtml = `
      <div class="auth-overlay" id="authOverlay">
        <div class="auth-modal">
          <button class="btn-close" id="closeAuthBtn" aria-label="Close"></button>
          <h4 style="color: var(--color-brand-primary); margin-bottom: 15px;">Login Required</h4>
          <p style="color: #666; margin-bottom: 20px;">Please log in or create an account to proceed.</p>
          <form id="popupLoginForm" style="text-align: left;">
            <div style="margin-bottom: 15px;">
              <label style="display: block; font-size: 14px; margin-bottom: 5px; color: var(--color-brand-primary);">Email Address</label>
              <input type="email" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Enter your email" required>
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-size: 14px; margin-bottom: 5px; color: var(--color-brand-primary);">Password</label>
              <input type="password" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="btn btn-buy w-100 mb-10" id="btnPopupSubmit">Sign In</button>
            <button type="button" id="btnSimulateLogin" class="btn btn-border w-100" style="color: var(--color-brand-primary);">Simulate Login (Test)</button>
          </form>
        </div>
      </div>
    `;
    $('body').append(modalHtml);
  }

  // Handle Close
  $(document).on('click', '#closeAuthBtn, #authOverlay', function(e) {
    if (e.target === this) {
      $('#authOverlay').removeClass('active');
    }
  });

  // Handle Simulate Login (from Test button)
  $(document).on('click', '#btnSimulateLogin', function(e) {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    $('#authOverlay').removeClass('active');
    alert('You are now logged in! You can add items to your cart and wishlist.');
  });

  // Handle actual form submission (Mimic Login)
  $(document).on('submit', '#popupLoginForm', function(e) {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    $('#authOverlay').removeClass('active');
    alert('Successfully logged in! You can now add items to your cart and wishlist.');
  });

  // Handle Logout
  $(document).on('click', 'a:contains("Logout")', function(e) {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    alert('You have successfully logged out.');
  });

  // Intercept Add to Cart, Buy, Wishlist, and Login actions
  const actionSelectors = [
    '.btn-cart', 
    '.btn-buy', 
    '.add-to-cart', 
    '.btn-wishlist', 
    '.icon-wishlist',
    'a[href*="checkout"]',
    'a[href*="page-account"]'
  ].join(', ');

  $(document).on('click', actionSelectors, function(e) {
    // Check if logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // If they are trying to go to their account page and are logged in, let them
    if (isLoggedIn && $(this).attr('href') && $(this).attr('href').includes('page-account')) {
      return; // allow normal navigation
    }

    // If it's a wishlist button, we need to handle the mock functionality
    const isWishlist = $(this).hasClass('btn-wishlist') || $(this).hasClass('icon-wishlist');

    if (!isLoggedIn) {
      e.preventDefault();
      $('#authOverlay').addClass('active');
      return;
    }

    if (isWishlist) {
      e.preventDefault();
      
      // Extract product details based on the context of the button
      let productTitle = "Product";
      let productPrice = "$0.00";
      let productImage = "assets/imgs/page/homepage1/imgsp4.png";

      // If on single product page
      if ($('h3.color-brand-3.mb-25').length) {
        productTitle = $('h3.color-brand-3.mb-25').text();
        productPrice = $('.price-main').first().text();
        productImage = $('.product-image-slider img').first().attr('src');
      } 
      // If clicking from a grid card
      else if ($(this).closest('.card-grid-inner').length || $(this).closest('.card-minimal').length) {
        const card = $(this).closest('.card-grid-inner').length ? $(this).closest('.card-grid-inner') : $(this).closest('.card-minimal');
        productTitle = card.find('.title, .font-sm-bold').first().text() || "Product";
        productPrice = card.find('.price-main, .price').first().text() || "$0.00";
        productImage = card.find('img').first().attr('src');
      }

      // Save to localStorage
      let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      // Avoid duplicates
      const exists = wishlist.find(item => item.title === productTitle);
      if (!exists) {
        wishlist.push({ title: productTitle, price: productPrice, image: productImage });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        alert(productTitle + ' added to your wishlist!');
      } else {
        alert(productTitle + ' is already in your wishlist.');
      }
    }
  });

  // Automatically render wishlist items if we are on the wishlist page
  if (window.location.pathname.includes('shop-wishlist.html')) {
    renderWishlist();
  }
});

function renderWishlist() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const wishlistContainer = $('.content-wishlist');
  
  if (!wishlistContainer.length) return; // Not on the right page or element missing

  if (wishlist.length === 0) {
    wishlistContainer.html('<div class="item-wishlist" style="justify-content: center;"><h5 class="color-brand-3 text-center">Your wishlist is empty.</h5></div>');
    return;
  }

  let html = '';
  wishlist.forEach((item, index) => {
    html += `
      <div class="item-wishlist">
        <div class="wishlist-cb">
          <input class="cb-layout cb-select" type="checkbox">
        </div>
        <div class="wishlist-product">
          <div class="product-wishlist">
            <div class="product-image"><a href="shop-single-product.html"><img src="${item.image}" alt="Product"></a></div>
            <div class="product-info"><a href="shop-single-product.html">
                <h6 class="color-brand-3">${item.title}</h6></a>
            </div>
          </div>
        </div>
        <div class="wishlist-price">
          <h4 class="color-brand-3">${item.price}</h4>
        </div>
        <div class="wishlist-status"><span class="btn btn-gray font-md-bold color-brand-3">In Stock</span></div>
        <div class="wishlist-action"><a class="btn btn-cart font-sm-bold add-to-cart" href="#">Add to Cart</a></div>
        <div class="wishlist-remove"><a class="btn btn-delete btn-remove-wishlist" href="#" data-index="${index}"></a></div>
      </div>
    `;
  });

  wishlistContainer.html(html);

  // Handle remove
  $('.btn-remove-wishlist').on('click', function(e) {
    e.preventDefault();
    const idx = $(this).data('index');
    let wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
    wl.splice(idx, 1);
    localStorage.setItem('wishlist', JSON.stringify(wl));
    renderWishlist();
  });
}
