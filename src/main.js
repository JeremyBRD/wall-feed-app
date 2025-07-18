import { fetchPosts, createPost } from "./api.js";

let currentPassword = null;

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const loginScreen = document.getElementById("login-screen");
  const feedScreen = document.getElementById("feed-screen");
  const passwordInput = document.getElementById("password-input");
  const accessFeedBtn = document.getElementById("access-feed-btn");
  const feedContainer = document.getElementById("feed");
  const addPostDesktopBtn = document.getElementById("add-post-desktop");
  const addPostMobileBtn = document.getElementById("add-post-mobile");
  const modal = document.getElementById("modal");
  const closeModalBtn = document.getElementById("close-modal");
  const submitPostBtn = document.getElementById("submit-post");

  // Form fields
  const ownerInput = document.getElementById("owner-input");
  const contentInput = document.getElementById("content-input");
  const imageInput = document.getElementById("image-input");

  // Show modal
  const showModal = () => {
    modal.classList.remove("hidden");
  };

  // Hide modal
  const hideModal = () => {
    modal.classList.add("hidden");
    ownerInput.value = "";
    contentInput.value = "";
    imageInput.value = "";
  };

  // Display posts
  const displayPosts = (posts) => {
    feedContainer.innerHTML = "";
    posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "post-card";

      const header = document.createElement("div");
      header.className = "post-owner";
      header.textContent = post.owner;

      const content = document.createElement("div");
      content.className = "post-content";
      content.textContent = post.content;

      card.appendChild(header);
      card.appendChild(content);

      if (post.image_base64) {
        const img = document.createElement("img");
        img.className = "post-image";
        img.src = post.image_base64;
        card.appendChild(img);
      }

      feedContainer.appendChild(card);
    });
  };

  // Encode file to base64
  const encodeImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve("");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle access
  accessFeedBtn.addEventListener("click", async () => {
    const password = passwordInput.value.trim();
    try {
      const posts = await fetchPosts(password);
      currentPassword = password;
      loginScreen.classList.add("hidden");
      feedScreen.classList.remove("hidden");
      displayPosts(posts);
    } catch (err) {
      alert("Mot de passe invalide !");
    }
  });

  // Show modal buttons
  addPostDesktopBtn.addEventListener("click", showModal);
  addPostMobileBtn.addEventListener("click", showModal);
  closeModalBtn.addEventListener("click", hideModal);

  // Submit new post
  submitPostBtn.addEventListener("click", async () => {
    const owner = ownerInput.value.trim();
    const content = contentInput.value.trim();
    const imageFile = imageInput.files[0];

    if (!owner || !content || content.length < 1) {
      alert("Remplis au minimum le prénom et un message.");
      return;
    }

    try {
      const image_base64 = await encodeImageToBase64(imageFile);
      await createPost({ password: currentPassword, owner, content, image_base64 });
      hideModal();
      const posts = await fetchPosts(currentPassword);
      displayPosts(posts);
    } catch (err) {
      alert("Erreur lors de la publication.");
    }
  });
});
