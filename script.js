const FREE_SHIPPING_THRESHOLD = 7000;
const STORAGE_KEY = "rollershop-cart-v1";
const LEGACY_STORAGE_KEY = "layerforge-cart-v1";
const ADMIN_EMAIL = "bp101109@yandex.ru";

const products = [
  {
    id: "rs-001",
    name: "Ящик",
    category: "Для развития",
    price: 250,
    material: "PLA",
    badge: "Новинка",
    popularScore: 90,
    createdAt: "2026-05-14",
    description: "Ящик для разных игр.",
    tags: ["ящик", "коробка", "игры"],
    colorOptions: ["Красный", "Желтый", "Синий", "Зеленый"],
    allowCustomColor: true,
    images: [
      "MCV_ChaosCubed_BPS_Apr28_Campaign_LineUp_1280x720.jpg",
      "MCV_ChaosCubed_BPS_Apr28_Campaign_TargetPractice_1280x720.jpg",
      "MCV_ChaosCubed_BPS_Apr28_EditorialExclusive_CampByTheGeyser_1170x500.jpg",
    ],
    gradient: "linear-gradient(135deg, #3f5d84 0%, #1e2e46 70%)",
  },
    {
    id: "rs-002",
    name: "Буквы (33 штуки)",
    category: "Для развития",
    price: 1500,
    material: "PLA",
    badge: "Новинка",
    popularScore: 90,
    createdAt: "2026-05-14",
    description: "Буквы для отработки гласных/согласных, твёрдых/мягких, шнуровка, а также выкладывание бусинок. \n От 5 штук 1250",
    tags: ["буквы", "алфавит", "игры", "шнуровка", "азбука"],
    images: [
      "MCV_ChaosCubed_BPS_Apr28_EditorialExclusive_CampByTheGeyser_1170x500.jpg",
    ],
    gradient: "linear-gradient(135deg, #3f5d84 0%, #1e2e46 70%)",
  },
    {
    id: "rs-003",
    name: "Буквы (1 штука)",
    category: "Для развития",
    price: 70,
    material: "PLA",
    badge: "Новинка",
    popularScore: 90,
    createdAt: "2026-05-14",
    description: "Буквы для отработки гласных/согласных, твёрдых/мягких, шнуровка, а также выкладывание бусинок.",
    tags: ["буквы", "алфавит", "игры", "шнуровка", "азбука"],
    images: [
      "MCV_ChaosCubed_BPS_Apr28_EditorialExclusive_CampByTheGeyser_1170x500.jpg",
    ],
    gradient: "linear-gradient(135deg, #3f5d84 0%, #1e2e46 70%)",
  },
];

const state = {
  search: "",
  category: "all",
  sort: "popular",
  cart: loadCart(),
};

const refs = {
  searchInput: document.getElementById("searchInput"),
  categorySelect: document.getElementById("categorySelect"),
  sortSelect: document.getElementById("sortSelect"),
  productsGrid: document.getElementById("productsGrid"),
  emptyState: document.getElementById("emptyState"),
  cartCount: document.getElementById("cartCount"),
  cartDrawer: document.getElementById("cartDrawer"),
  overlay: document.getElementById("overlay"),
  openCartButton: document.getElementById("openCartButton"),
  closeCartButton: document.getElementById("closeCartButton"),
  cartItems: document.getElementById("cartItems"),
  subtotalValue: document.getElementById("subtotalValue"),
  shippingValue: document.getElementById("shippingValue"),
  totalValue: document.getElementById("totalValue"),
  checkoutButton: document.getElementById("checkoutButton"),
  shippingHint: document.getElementById("shippingHint"),
  shippingProgress: document.getElementById("shippingProgress"),
  productModal: document.getElementById("productModal"),
  modalBody: document.getElementById("modalBody"),
  closeModalButton: document.getElementById("closeModalButton"),
  chatToggleButton: document.getElementById("chatToggleButton"),
  chatPanel: document.getElementById("chatPanel"),
  chatCloseButton: document.getElementById("chatCloseButton"),
  chatForm: document.getElementById("chatForm"),
  chatNameInput: document.getElementById("chatNameInput"),
  chatInput: document.getElementById("chatInput"),
};

boot();

function boot() {
  renderCategoryOptions();
  renderProducts();
  renderCart();
  bindEvents();
  initRevealAnimation();
  initChat();
}

function renderCategoryOptions() {
  const categories = ["all", ...new Set(products.map((item) => item.category))];
  refs.categorySelect.innerHTML = categories
    .map((category) => {
      if (category === "all") {
        return '<option value="all">Все категории</option>';
      }
      return `<option value="${category}">${category}</option>`;
    })
    .join("");
}

function bindEvents() {
  refs.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderProducts();
  });

  refs.categorySelect.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderProducts();
  });

  refs.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  refs.productsGrid.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const addButton = target.closest("[data-add-to-cart]");
    if (addButton) {
      const productId = addButton.dataset.addToCart;
      const product = products.find((item) => item.id === productId);
      if (product && hasColorConfig(product)) {
        openProductModal(productId);
        return;
      }
      addToCart(productId);
      return;
    }

    const modalButton = target.closest("[data-open-modal]");
    if (modalButton) {
      openProductModal(modalButton.dataset.openModal);
    }
  });

  refs.openCartButton.addEventListener("click", openCart);
  refs.closeCartButton.addEventListener("click", closeCart);
  refs.checkoutButton.addEventListener("click", startCheckout);
  refs.overlay.addEventListener("click", () => {
    closeCart();
    closeModal();
  });

  refs.closeModalButton.addEventListener("click", closeModal);
  refs.productModal.addEventListener("click", (event) => {
    const dialogRect = refs.productModal.getBoundingClientRect();
    const insideDialog =
      event.clientX >= dialogRect.left &&
      event.clientX <= dialogRect.right &&
      event.clientY >= dialogRect.top &&
      event.clientY <= dialogRect.bottom;
    if (!insideDialog) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeModal();
      closeChat();
    }
  });

  if (refs.chatToggleButton) {
    refs.chatToggleButton.addEventListener("click", toggleChat);
  }
  if (refs.chatCloseButton) {
    refs.chatCloseButton.addEventListener("click", closeChat);
  }
  if (refs.chatForm) {
    refs.chatForm.addEventListener("submit", handleChatSubmit);
  }
}

function getFilteredProducts() {
  const list = products.filter((item) => {
    const matchesSearch =
      state.search.length === 0 ||
      item.name.toLowerCase().includes(state.search) ||
      item.description.toLowerCase().includes(state.search) ||
      item.tags.some((tag) => tag.toLowerCase().includes(state.search));
    const matchesCategory = state.category === "all" || item.category === state.category;
    return matchesSearch && matchesCategory;
  });

  switch (state.sort) {
    case "newest":
      return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case "priceAsc":
      return [...list].sort((a, b) => a.price - b.price);
    case "priceDesc":
      return [...list].sort((a, b) => b.price - a.price);
    case "popular":
    default:
      return [...list].sort((a, b) => b.popularScore - a.popularScore);
  }
}

function renderProducts() {
  const list = getFilteredProducts();

  refs.emptyState.classList.toggle("hidden", list.length > 0);
  refs.productsGrid.innerHTML = list
    .map(
      (item) => `
        <article class="product-card">
          ${renderProductVisual(item)}
          <div class="product-content">
            <div class="product-head">
              <h3>${item.name}</h3>
              <span class="price">${formatPrice(item.price)}</span>
            </div>
            <div class="meta">
              <span>${item.material}</span>
            </div>
            <div class="card-actions">
              <button type="button" class="btn btn-primary" data-add-to-cart="${item.id}">В корзину</button>
              <button type="button" class="btn btn-ghost" data-open-modal="${item.id}">Подробнее</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  wireGalleryInteractions(refs.productsGrid);
}

function addToCart(productId, options = {}) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  const normalizedOptions = normalizeProductOptions(product, options);
  const lineKey = getCartLineKey(productId, normalizedOptions.color);
  const line = state.cart.find((item) => getCartLineKey(item.id, item.color) === lineKey);
  if (line) {
    line.quantity += 1;
  } else {
    state.cart.push({
      id: productId,
      quantity: 1,
      color: normalizedOptions.color,
      baseColor: normalizedOptions.baseColor,
      customColor: normalizedOptions.customColor,
    });
  }

  persistCart();
  renderCart();
  openCart();
}

function removeFromCart(lineKey) {
  state.cart = state.cart.filter((line) => getCartLineKey(line.id, line.color) !== lineKey);
  persistCart();
  renderCart();
}

function changeQuantity(lineKey, delta) {
  const line = state.cart.find((item) => getCartLineKey(item.id, item.color) === lineKey);
  if (!line) {
    return;
  }

  line.quantity += delta;
  if (line.quantity <= 0) {
    removeFromCart(lineKey);
    return;
  }

  persistCart();
  renderCart();
}

function getCartDetailedLines() {
  return state.cart
    .map((line) => {
      const product = products.find((item) => item.id === line.id);
      if (!product) {
        return null;
      }
      return {
        ...line,
        product,
        lineTotal: product.price * line.quantity,
      };
    })
    .filter(Boolean);
}

function renderCart() {
  const lines = getCartDetailedLines();
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 390;
  const total = subtotal + shipping;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  refs.cartCount.textContent = String(itemCount);
  refs.subtotalValue.textContent = formatPrice(subtotal);
  refs.shippingValue.textContent = shipping === 0 ? "Бесплатно" : formatPrice(shipping);
  refs.totalValue.textContent = formatPrice(total);
  refs.shippingProgress.style.width = `${progress}%`;

  if (subtotal === 0) {
    refs.shippingHint.textContent = `Добавьте товары на ${formatPrice(
      FREE_SHIPPING_THRESHOLD,
    )} для бесплатной доставки`;
  } else if (subtotal < FREE_SHIPPING_THRESHOLD) {
    refs.shippingHint.textContent = `До бесплатной доставки осталось ${formatPrice(
      FREE_SHIPPING_THRESHOLD - subtotal,
    )}`;
  } else {
    refs.shippingHint.textContent = "У вас бесплатная доставка";
  }

  if (lines.length === 0) {
    refs.cartItems.innerHTML = '<p class="cart-empty">Корзина пока пустая. Добавьте что-нибудь из каталога.</p>';
    return;
  }

  refs.cartItems.innerHTML = lines
    .map(
      (line) => `
        <article class="cart-item">
          <header>
            <h4>${line.product.name}</h4>
            <strong>${formatPrice(line.lineTotal)}</strong>
          </header>
          <small>${line.product.material} • ${line.product.leadDays} дн.${line.color ? ` • Цвет: ${line.color}` : ""}</small>
          <div class="qty-controls">
            <button data-qty-change="${getCartLineKey(line.product.id, line.color)}" data-delta="-1">−</button>
            <span>${line.quantity} шт.</span>
            <button data-qty-change="${getCartLineKey(line.product.id, line.color)}" data-delta="1">+</button>
            <button class="remove-btn" data-remove="${getCartLineKey(line.product.id, line.color)}">Удалить</button>
          </div>
        </article>
      `,
    )
    .join("");

  refs.cartItems.querySelectorAll("[data-qty-change]").forEach((button) => {
    button.addEventListener("click", () => {
      changeQuantity(button.dataset.qtyChange, Number(button.dataset.delta));
    });
  });

  refs.cartItems.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.remove));
  });
}

function openCart() {
  refs.cartDrawer.classList.add("open");
  refs.cartDrawer.setAttribute("aria-hidden", "false");
  refs.overlay.classList.add("active");
}

function closeCart() {
  refs.cartDrawer.classList.remove("open");
  refs.cartDrawer.setAttribute("aria-hidden", "true");
  refs.overlay.classList.remove("active");
}

function openProductModal(productId) {
  const item = products.find((product) => product.id === productId);
  if (!item) {
    return;
  }

  refs.modalBody.innerHTML = `
    ${renderProductVisual(item, true)}
    <div class="modal-content">
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <ul class="modal-list">
        <li><span>Цена</span><strong>${formatPrice(item.price)}</strong></li>
        <li><span>Материал</span><strong>${item.material}</strong></li>
      </ul>
      ${renderColorControls(item)}
      <button class="btn btn-primary wide" data-modal-add="${item.id}">Добавить в корзину</button>
    </div>
  `;

  const addButton = refs.modalBody.querySelector("[data-modal-add]");
  addButton.addEventListener("click", () => {
    addToCart(item.id, readColorControls(item));
    closeModal();
  });

  wireGalleryInteractions(refs.modalBody);

  refs.productModal.showModal();
  refs.overlay.classList.add("active");
}

function renderProductVisual(item, isModal = false) {
  const wrapperClass = isModal ? "modal-visual" : "product-visual";
  const imageClass = isModal ? "modal-image" : "product-image";
  const images = getProductImages(item);
  const hasImages = images.length > 0;
  const className = hasImages ? `${wrapperClass} has-image` : wrapperClass;
  const slidesMarkup = hasImages
    ? images
        .map(
          (src, index) =>
            `<img class="${imageClass} gallery-slide${index === 0 ? " is-active" : ""}" src="${src}" alt="${item.name}" data-gallery-slide="${index}" />`,
        )
        .join("")
    : '<div class="wireframe"></div>';
  const controlsMarkup =
    images.length > 1
      ? `
      <button type="button" class="gallery-arrow prev" data-gallery-prev aria-label="Предыдущее фото">‹</button>
      <button type="button" class="gallery-arrow next" data-gallery-next aria-label="Следующее фото">›</button>
      <div class="gallery-dots">
        ${images
          .map(
            (_, index) =>
              `<span class="gallery-dot${index === 0 ? " is-active" : ""}" data-gallery-dot="${index}"></span>`,
          )
          .join("")}
      </div>
    `
      : "";
  return `
    <div class="${className}" style="--card-gradient: ${item.gradient}">
      <div class="gallery" data-gallery-index="0">
        ${slidesMarkup}
        ${controlsMarkup}
      </div>
      <span class="product-badge">${item.badge}</span>
      <span class="product-category">${item.category}</span>
    </div>
  `;
}

function getProductImages(item) {
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images.filter((src) => typeof src === "string" && src.trim().length > 0);
  }
  if (Array.isArray(item.image) && item.image.length > 0) {
    return item.image.filter((src) => typeof src === "string" && src.trim().length > 0);
  }
  if (typeof item.image === "string" && item.image.trim().length > 0) {
    return [item.image];
  }
  return [];
}

function wireGalleryInteractions(scope) {
  if (!scope) {
    return;
  }
  const galleries = scope.querySelectorAll(".gallery");
  galleries.forEach((gallery) => {
    if (gallery.dataset.wired === "1") {
      return;
    }
    gallery.dataset.wired = "1";

    gallery.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest("[data-gallery-prev]")) {
        shiftGallery(gallery, -1);
        return;
      }
      if (target.closest("[data-gallery-next]")) {
        shiftGallery(gallery, 1);
        return;
      }
      const dot = target.closest("[data-gallery-dot]");
      if (dot) {
        setGalleryIndex(gallery, Number(dot.dataset.galleryDot));
      }
    });

    let startX = 0;
    let endX = 0;
    gallery.addEventListener(
      "touchstart",
      (event) => {
        startX = event.changedTouches[0]?.clientX ?? 0;
      },
      { passive: true },
    );
    gallery.addEventListener(
      "touchend",
      (event) => {
        endX = event.changedTouches[0]?.clientX ?? 0;
        const delta = endX - startX;
        if (Math.abs(delta) < 35) {
          return;
        }
        if (delta < 0) {
          shiftGallery(gallery, 1);
        } else {
          shiftGallery(gallery, -1);
        }
      },
      { passive: true },
    );
  });
}

function hasColorConfig(product) {
  return Array.isArray(product.colorOptions) && product.colorOptions.length > 0;
}

function renderColorControls(product) {
  if (!hasColorConfig(product)) {
    return "";
  }
  const optionMarkup = product.colorOptions
    .map((color) => `<option value="${color}">${color}</option>`)
    .join("");

  return `
    <div class="color-config">
      <label for="modalColorSelect">Цвет</label>
      <select id="modalColorSelect">
        ${optionMarkup}
      </select>
      <label for="modalCustomColorInput">Свой цвет:</label>
      <input id="modalCustomColorInput" type="text" placeholder="Например: Оранжевый" />
    </div>
  `;
}

function readColorControls(product) {
  if (!hasColorConfig(product)) {
    return {};
  }
  const selectedColor = document.getElementById("modalColorSelect")?.value || product.colorOptions[0];
  const customColor = document.getElementById("modalCustomColorInput")?.value.trim() || "";
  return { color: selectedColor, customColor };
}

function normalizeProductOptions(product, options) {
  if (!hasColorConfig(product)) {
    return { color: "", baseColor: "", customColor: "" };
  }
  const baseColor = typeof options.color === "string" && options.color.trim().length > 0
    ? options.color.trim()
    : product.colorOptions[0];
  const customColor = typeof options.customColor === "string" ? options.customColor.trim() : "";
  const color = customColor || baseColor;
  return {
    color,
    baseColor,
    customColor,
  };
}

function getCartLineKey(productId, color = "") {
  return `${productId}::${(color || "").toLowerCase()}`;
}

function shiftGallery(gallery, delta) {
  const slides = gallery.querySelectorAll("[data-gallery-slide]");
  const total = slides.length;
  if (total <= 1) {
    return;
  }
  const current = Number(gallery.dataset.galleryIndex || 0);
  const next = (current + delta + total) % total;
  setGalleryIndex(gallery, next);
}

function setGalleryIndex(gallery, nextIndex) {
  const slides = gallery.querySelectorAll("[data-gallery-slide]");
  if (slides.length === 0) {
    return;
  }
  const dots = gallery.querySelectorAll("[data-gallery-dot]");
  gallery.dataset.galleryIndex = String(nextIndex);
  slides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === nextIndex);
  });
  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === nextIndex);
  });
}

function initChat() {
  // Direct admin contact mode: no AI setup required.
}

function toggleChat() {
  if (!refs.chatPanel) {
    return;
  }
  refs.chatPanel.classList.toggle("hidden");
}

function closeChat() {
  if (!refs.chatPanel) {
    return;
  }
  refs.chatPanel.classList.add("hidden");
}

function handleChatSubmit(event) {
  event.preventDefault();
  const name = refs.chatNameInput?.value.trim() || "Без имени";
  const text = refs.chatInput?.value.trim();
  if (!text) {
    return;
  }

  refs.chatInput.value = "";
  const subject = encodeURIComponent("Сообщение с сайта RollerShop");
  const body = encodeURIComponent(`Имя: ${name}\n\nСообщение:\n${text}`);
  window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
}

function closeModal() {
  if (refs.productModal.open) {
    refs.productModal.close();
  }
  refs.overlay.classList.remove("active");
}

function startCheckout() {
  const lines = getCartDetailedLines();
  if (lines.length === 0) {
    alert("Корзина пока пустая. Добавьте товары для оформления заказа.");
    return;
  }

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const body = [
    "Здравствуйте! Хочу оформить заказ:",
    "",
    ...lines.map((line) => {
      const colorInfo = line.color ? ` (Цвет: ${line.color})` : "";
      return `- ${line.product.name}${colorInfo} x ${line.quantity} = ${formatPrice(line.lineTotal)}`;
    }),
    "",
    `Итого: ${formatPrice(total)}`,
  ].join("\n");

  const url = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
    "Новый заказ RollerShop",
  )}&body=${encodeURIComponent(body)}`;

  window.location.href = url;
}

function persistCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  } catch {
    // In-app or file:// contexts may block storage; cart still works in memory.
  }
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((line) => typeof line?.id === "string" && Number.isInteger(line?.quantity))
      .map((line) => ({
        id: line.id,
        quantity: Math.max(1, line.quantity),
        color: typeof line?.color === "string" ? line.color : "",
        baseColor: typeof line?.baseColor === "string" ? line.baseColor : "",
        customColor: typeof line?.customColor === "string" ? line.customColor : "",
      }));
  } catch {
    return [];
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function initRevealAnimation() {
  const revealNodes = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  revealNodes.forEach((node) => observer.observe(node));
}
