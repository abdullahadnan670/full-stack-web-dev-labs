// ==========================================
// 1. DUMMY DATA & STORAGE HELPERS
// ==========================================
const defaultUsers = [
  { id: "u1", username: "alice", password: "wonderland", name: "Alice Morgan", bio: "Tech enthusiast.", lastLogin: Date.now() - 100000, friends: ["u2", "u3"], ignoreList: [], ratings: { u2: 2 } },
  { id: "u2", username: "marco", password: "sunrise", name: "Marco Reyes", bio: "Cyclist & baker.", lastLogin: Date.now() - 50000, friends: ["u1"], ignoreList: [], ratings: { u1: 3 } },
  { id: "u3", username: "nina", password: "stargazer", name: "Nina Park", bio: "Artist & traveler.", lastLogin: Date.now() - 200000, friends: ["u1"], ignoreList: ["u4"], ratings: {} }, // nina ignores u4
  { id: "u4", username: "sam", password: "orbit", name: "Sam Okafor", bio: "Music curator.", lastLogin: Date.now() - 300000, friends: [], ignoreList: [], ratings: {} }
];

const defaultPosts = [
  { id: "p1", authorId: "u2", content: "Enjoyed a long bike ride today along the river! 🚲", timestamp: Date.now() - 50000, likes: ["u1"], dislikes: [], sharedWith: "all" },
  { id: "p2", authorId: "u3", content: "Finished my new ceramic bowl today! ✨", timestamp: Date.now() - 200000, likes: [], dislikes: [], sharedWith: ["u1"] }
];

const defaultMessages = [
  { senderId: "u2", receiverId: "u1", text: "Hey Alice, see you this weekend!" }
];

function getUsers() {
  if (!localStorage.getItem("cf_users")) {
    localStorage.setItem("cf_users", JSON.stringify(defaultUsers));
  }
  return JSON.parse(localStorage.getItem("cf_users"));
}

function saveUsers(users) {
  localStorage.setItem("cf_users", JSON.stringify(users));
}

function getPosts() {
  if (!localStorage.getItem("cf_posts")) {
    localStorage.setItem("cf_posts", JSON.stringify(defaultPosts));
  }
  return JSON.parse(localStorage.getItem("cf_posts"));
}

function savePosts(posts) {
  localStorage.setItem("cf_posts", JSON.stringify(posts));
}

function getMessages() {
  if (!localStorage.getItem("cf_messages")) {
    localStorage.setItem("cf_messages", JSON.stringify(defaultMessages));
  }
  return JSON.parse(localStorage.getItem("cf_messages"));
}

function saveMessages(msgs) {
  localStorage.setItem("cf_messages", JSON.stringify(msgs));
}

function getCurrentUser() {
  const currentId = localStorage.getItem("cf_currentId");
  return getUsers().find(u => u.id === currentId);
}

// ==========================================
// 2. LOGIN & AUTH
// ==========================================
function handleLogin(e) {
  e.preventDefault();
  const uInput = document.getElementById("username").value.trim();
  const pInput = document.getElementById("password").value;
  
  const users = getUsers();
  const match = users.find(u => u.username === uInput && u.password === pInput);

  if (match) {
    match.lastLogin = Date.now();
    saveUsers(users);
    localStorage.setItem("cf_currentId", match.id);
    window.location.href = "home.html";
  } else {
    alert("Invalid username or password!");
  }
}

function logout() {
  localStorage.removeItem("cf_currentId");
  window.location.href = "index.html";
}

// ==========================================
// 3. HOME FEED, POSTING & LIKE/DISLIKE
// ==========================================
function initHome() {
  const me = getCurrentUser();
  if (!me) { window.location.href = "index.html"; return; }

  renderFriendPicker(me);
  renderFeed(me);
  renderUserSelect(me);
  loadMessages();
}

function toggleFriendPicker(show) {
  const picker = document.getElementById("friendPicker");
  if (show) picker.classList.remove("hidden");
  else picker.classList.add("hidden");
}

function renderFriendPicker(me) {
  const picker = document.getElementById("friendPicker");
  const users = getUsers();
  const friends = users.filter(u => me.friends.includes(u.id));

  picker.innerHTML = friends.map(f => `
    <label class="flex items-center gap-2">
      <input type="checkbox" name="selectedFriends" value="${f.id}"> ${f.name}
    </label>
  `).join("") || "<p class='col-span-2 text-slate-500'>No friends available</p>";
}

function createPost() {
  const content = document.getElementById("postContent").value.trim();
  if (!content) return alert("Write something to post!");

  const me = getCurrentUser();
  const audience = document.querySelector('input[name="audience"]:checked').value;
  
  let sharedWith = "all";
  if (audience === "some") {
    const checked = [...document.querySelectorAll('input[name="selectedFriends"]:checked')].map(c => c.value);
    if (checked.length === 0) return alert("Select at least one friend!");
    sharedWith = checked;
  }

  const posts = getPosts();
  posts.unshift({
    id: "p" + Date.now(),
    authorId: me.id,
    content: content,
    timestamp: Date.now(),
    likes: [],
    dislikes: [],
    sharedWith: sharedWith
  });

  savePosts(posts);
  document.getElementById("postContent").value = "";
  renderFeed(me);
}

function renderFeed(me) {
  const container = document.getElementById("feedContainer");
  const users = getUsers();
  const posts = getPosts();

  // Requirement: Order friends by latest login time
  const friendUsers = users.filter(u => me.friends.includes(u.id))
                           .sort((a, b) => b.lastLogin - a.lastLogin);
  
  const friendOrderMap = {};
  friendUsers.forEach((f, idx) => friendOrderMap[f.id] = idx);

  // Filter posts shared with current user
  const feedPosts = posts.filter(post => {
    if (post.authorId === me.id) return true;
    if (!me.friends.includes(post.authorId)) return false;
    if (post.sharedWith === "all") return true;
    if (Array.isArray(post.sharedWith) && post.sharedWith.includes(me.id)) return true;
    return false;
  }).sort((a, b) => {
    const orderA = friendOrderMap[a.authorId] ?? 99;
    const orderB = friendOrderMap[b.authorId] ?? 99;
    return orderA - orderB || b.timestamp - a.timestamp;
  });

  if (feedPosts.length === 0) {
    container.innerHTML = `<div class="bg-slate-900 p-8 text-center rounded-2xl text-slate-400">No posts in your feed!</div>`;
    return;
  }

  container.innerHTML = feedPosts.map(post => {
    const author = users.find(u => u.id === post.authorId);
    const minsAgo = Math.floor((Date.now() - author.lastLogin) / 60000);
    const isLiked = post.likes.includes(me.id);
    const isDisliked = post.dislikes.includes(me.id);

    return `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div class="mb-3">
          <h3 class="font-bold text-sm text-emerald-400">${author.name}</h3>
          <span class="text-[10px] text-slate-400">Last login: ${minsAgo < 1 ? "Just now" : minsAgo + " mins ago"}</span>
        </div>
        <p class="text-sm mb-4 text-slate-200">${post.content}</p>
        <div class="flex items-center gap-4 text-xs border-t border-slate-800 pt-3">
          <button onclick="toggleReact('${post.id}', 'like')" class="${isLiked ? 'text-emerald-400 font-bold' : 'text-slate-400'}">
            ❤️ Like (${post.likes.length})
          </button>
          <button onclick="toggleReact('${post.id}', 'dislike')" class="${isDisliked ? 'text-amber-400 font-bold' : 'text-slate-400'}">
            👎 Dislike (${post.dislikes.length})
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function toggleReact(postId, kind) {
  const me = getCurrentUser();
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);

  if (!post) return;

  if (kind === "like") {
    if (post.likes.includes(me.id)) {
      post.likes = post.likes.filter(id => id !== me.id);
    } else {
      post.likes.push(me.id);
      post.dislikes = post.dislikes.filter(id => id !== me.id);
    }
  } else {
    if (post.dislikes.includes(me.id)) {
      post.dislikes = post.dislikes.filter(id => id !== me.id);
    } else {
      post.dislikes.push(me.id);
      post.likes = post.likes.filter(id => id !== me.id);
    }
  }

  savePosts(posts);
  renderFeed(me);
}

// ==========================================
// 4. PRIVATE MESSAGING UI
// ==========================================
function renderUserSelect(me) {
  const select = document.getElementById("chatUser");
  const users = getUsers().filter(u => u.id !== me.id);

  select.innerHTML = users.map(u => `
    <option value="${u.id}">${u.name} ${me.friends.includes(u.id) ? '(Friend)' : ''}</option>
  `).join("");
}

function loadMessages() {
  const me = getCurrentUser();
  const recipientId = document.getElementById("chatUser").value;
  const history = document.getElementById("messageHistory");
  const msgs = getMessages();

  const activeMsgs = msgs.filter(m => 
    (m.senderId === me.id && m.receiverId === recipientId) ||
    (m.senderId === recipientId && m.receiverId === me.id)
  );

  if (activeMsgs.length === 0) {
    history.innerHTML = `<p class="text-slate-500 text-center">No messages yet.</p>`;
    return;
  }

  history.innerHTML = activeMsgs.map(m => `
    <div class="${m.senderId === me.id ? 'text-right' : 'text-left'}">
      <span class="inline-block p-2 rounded-xl text-xs ${m.senderId === me.id ? 'bg-amber-400 text-slate-950 font-semibold' : 'bg-slate-800 text-white'}">
        ${m.text}
      </span>
    </div>
  `).join("");
}

function sendMessage() {
  const textInput = document.getElementById("messageText");
  const text = textInput.value.trim();
  const recipientId = document.getElementById("chatUser").value;
  const me = getCurrentUser();

  if (!text || !recipientId) return;

  const msgs = getMessages();
  msgs.push({ senderId: me.id, receiverId: recipientId, text: text });
  saveMessages(msgs);
  textInput.value = "";
  loadMessages();
}

// ==========================================
// 5. PROFILE, RATING & IGNORE LIST CHECK
// ==========================================
function initProfile() {
  const me = getCurrentUser();
  if (!me) { window.location.href = "index.html"; return; }

  renderProfile(me);
  renderFriendsList(me);
  renderOtherUsers(me);
}

function renderProfile(me) {
  const card = document.getElementById("profileCard");
  card.innerHTML = `
    <h2 class="text-2xl font-black text-emerald-400 mb-1">${me.name}</h2>
    <p class="text-xs text-slate-400 mb-3">@${me.username}</p>
    <p class="text-sm text-slate-300 mb-4">${me.bio}</p>
    <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
      <p class="text-slate-400">Total Friends: <b class="text-white">${me.friends.length}</b></p>
    </div>
  `;
}

function renderFriendsList(me) {
  const list = document.getElementById("friendsList");
  const users = getUsers();
  const friends = users.filter(u => me.friends.includes(u.id));

  if (friends.length === 0) {
    list.innerHTML = `<p class="text-slate-500 text-sm">No friends in your circle yet.</p>`;
    return;
  }

  // Requirement: Rating 1-3 (1: Stupid 🤪, 2: Cool 😎, 3: Trustworthy 🛡️)
  list.innerHTML = friends.map(f => {
    const currentRating = me.ratings ? me.ratings[f.id] : "";
    return `
      <div class="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
        <div>
          <h4 class="font-bold text-sm">${f.name}</h4>
          <span class="text-xs text-slate-500">@${f.username}</span>
        </div>
        <select onchange="rateFriend('${f.id}', this.value)" class="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white">
          <option value="">Rate Friend</option>
          <option value="1" ${currentRating == 1 ? 'selected' : ''}>🤪 1 - Stupid</option>
          <option value="2" ${currentRating == 2 ? 'selected' : ''}>😎 2 - Cool</option>
          <option value="3" ${currentRating == 3 ? 'selected' : ''}>🛡️ 3 - Trustworthy</option>
        </select>
      </div>
    `;
  }).join("");
}

function rateFriend(friendId, ratingVal) {
  const users = getUsers();
  const me = users.find(u => u.id === localStorage.getItem("cf_currentId"));

  if (!me.ratings) me.ratings = {};
  if (ratingVal) me.ratings[friendId] = Number(ratingVal);
  else delete me.ratings[friendId];

  saveUsers(users);
  alert("Friend rating updated!");
}

function renderOtherUsers(me) {
  const list = document.getElementById("otherUsersList");
  const users = getUsers();
  const others = users.filter(u => u.id !== me.id && !me.friends.includes(u.id));

  if (others.length === 0) {
    list.innerHTML = `<p class="text-slate-500 text-sm">No other members available.</p>`;
    return;
  }

  list.innerHTML = others.map(u => `
    <div class="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
      <div>
        <h4 class="font-bold text-sm">${u.name}</h4>
        <span class="text-xs text-slate-500">@${u.username}</span>
      </div>
      <button onclick="sendFriendRequest('${u.id}')" class="bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-amber-300">
        + Connect
      </button>
    </div>
  `).join("");
}

// Requirement: Check if sender is in target user's Ignore List
function sendFriendRequest(targetId) {
  const me = getCurrentUser();
  const users = getUsers();
  const targetUser = users.find(u => u.id === targetId);

  if (!targetUser) return;

  // IGNORE LIST CHECK
  if (targetUser.ignoreList && targetUser.ignoreList.includes(me.id)) {
    alert("❌ Request Failed: You cannot send a friend request because you are on this person's Ignore List!");
    return;
  }

  const meInUsers = users.find(u => u.id === me.id);
  meInUsers.friends.push(targetId);
  targetUser.friends.push(me.id);

  saveUsers(users);
  alert(`✅ Connected with ${targetUser.name}!`);
  initProfile();
}