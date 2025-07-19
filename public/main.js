import { fetchPosts, createPost } from "./api.js";

let currentPassword = null;

document.addEventListener("DOMContentLoaded", () => {
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

  const ownerInput = document.getElementById("owner-input");
  const contentInput = document.getElementById("content-input");
  const imageInput = document.getElementById("image-input");

  const imageInfo = document.getElementById("image-info");
  const imageLabel = document.querySelector("label[for='image-input']");

  const feedTitleElement = document.getElementById("feed-title"); // Nouveau : cibler l'élément du titre

  const showModal = () => {
    modal.style.display = "flex";
  };

  const hideModal = () => {
    modal.style.display = "none";
    ownerInput.value = "";
    contentInput.value = "";
    imageInput.value = "";

    imageInfo.classList.add("hidden");
    imageInfo.textContent = "";
    imageLabel.textContent = "Ajouter une photo";
  };

  closeModalBtn.addEventListener("click", hideModal);
  addPostDesktopBtn.addEventListener("click", showModal);
  addPostMobileBtn.addEventListener("click", showModal);

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      imageInfo.textContent = `📸 ${file.name}`;
      imageInfo.classList.remove("hidden");
      imageLabel.textContent = "Changer la photo";
    } else {
      imageInfo.classList.add("hidden");
      imageInfo.textContent = "";
      imageLabel.textContent = "Ajouter une photo";
    }
  });

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

    document.querySelectorAll(".post-card").forEach(card => {
      const img = card.querySelector(".post-image");
      if (!img || !img) {
        if (img) img.style.display = "none";
      }
    });
  };

  const encodeImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve("");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  accessFeedBtn.addEventListener("click", async () => {
    const password = passwordInput.value.trim();
    try {
      const response = await fetchPosts(password); // Change ici : la réponse est un objet
      currentPassword = password;
      loginScreen.classList.add("hidden");
      feedScreen.classList.remove("hidden");
      displayPosts(response.posts); // Accède aux posts via response.posts
      if (response.feedName && feedTitleElement) {
        feedTitleElement.textContent = response.feedName; // Met à jour le titre du feed
      }
    } catch (err) {
      alert("Mot de passe invalide !");
    }
  });

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
      const response = await fetchPosts(currentPassword); // Change ici : la réponse est un objet
      displayPosts(response.posts); // Accède aux posts via response.posts
    } catch (err) {
      alert("Erreur lors de la publication.");
    }
  });
});
