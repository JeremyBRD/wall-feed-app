const API_URL = "https://script.google.com/macros/s/AKfycbzOJvcPBMHfTqvET5bWN39vMveiBU7ISV8Oumc1hskYC95H73bokB9fdtbDYFHwuHdk/exec";

export async function fetchPosts(password) {
  try {
    const res = await fetch(`${API_URL}?password=${encodeURIComponent(password)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error("Erreur fetchPosts:", error);
    throw error;
  }
}

export async function createPost({ password, owner, content, image_base64 }) {
  try {
    const body = {
      password,
      owner,
      content,
      image_base64,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Échec de la publication");
    return data;
  } catch (error) {
    console.error("Erreur createPost:", error);
    throw error;
  }
}
