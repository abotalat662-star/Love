const spinBtn = document.getElementById("spin-btn");
const passwordModal = document.getElementById("password-modal");
const passwordInput = document.getElementById("password-input");
const submitPassword = document.getElementById("submit-password");
const logo = document.getElementById("logo");
const adminPanel = document.getElementById("admin-panel");
const prizeSettings = document.getElementById("prize-settings");
const saveAdmin = document.getElementById("save-admin");
const winnerDiv = document.getElementById("winner");
const winnerText = document.getElementById("winner-text");
const winnerImg = document.getElementById("winner-img");
const wheelCover = document.getElementById("wheel-cover-img");

let spinAllowed = false;
let clickCount = 0;
let clickTimer;

let prizes = [
  {name:"Free Side", prob:10, img:"side.png"},
  {name:"Free Dessert", prob:10, img:"dessert.png"},
  {name:"Free Coffee", prob:10, img:"coffee.png"},
  {name:"Free Coke", prob:15, img:"coke.png"},
  {name:"Free Fries", prob:15, img:"fries.png"},
  {name:"Free Burger", prob:10, img:"burger.png"},
  {name:"10% OFF", prob:10, img:"discount.png"},
  {name:"20% OFF", prob:10, img:"discount20.png"},
  {name:"Try Again", prob:10, img:"try.png"},
  {name:"Lose", prob:10, img:"lose.png"}
];

const segmentColors = [
  "#d10101", "#C0C0C0", "#8B0000", "#2E8B57",
  "#1E90FF", "#800080", "#FF8C00", "#333333",
  "#FFD700", "#FF4500"
];

const loseMessages = [
  "You lost, champ… the wheel’s got beef with you!😂 خسرت يا بطل.. العجلة مش بتحبك!",
  "You’re gonna need a lot more practice, champ!🤣 شكلك محتاج تدريب أكتر!",
  "The wheel said nope… try your luck again!😅 العجلة قالتلك لأ.. جرب حظك تاني!",
  "You lost… but look, you’re still smiling!🙃 خسارة.. بس على الأقل عندك ابتسامة!",
  "The wheel laughed at you… try again after the password!🤪 العجلة ضحكت عليك.. حاول تاني بعد الباسورد!"
];

const tryAgainMessages = [
  "Spin it again!🔄 جرب مرة تانية!",
  "You’ve still got a chance!😎 لسه عندك فرصة!",
  "The wheel’s giving you hope again!😉 العجلة بتديك أمل تاني!",
  " Second try might be luckier!🔥 المحاولة التانية ممكن تكون أوفر!",
  " Try again, maybe you’ll win!💡 جرب تاني يمكن تكسب!"
];

// رسم العجلة
function drawWheel() {
  const wheel = document.getElementById("wheel");
  wheel.width = wheel.offsetWidth;
  wheel.height = wheel.offsetWidth;
  const ctx = wheel.getContext("2d");
  const numSegments = prizes.length;
  const anglePerSegment = (2 * Math.PI) / numSegments;

  ctx.clearRect(0, 0, wheel.width, wheel.height);

  for (let i = 0; i < numSegments; i++) {
    const startAngle = i * anglePerSegment;
    const endAngle = startAngle + anglePerSegment;

    ctx.beginPath();
    ctx.moveTo(wheel.width / 2, wheel.height / 2);
    ctx.arc(wheel.width / 2, wheel.height / 2, wheel.width / 2, startAngle, endAngle);
    ctx.fillStyle = segmentColors[i];
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(wheel.width / 2, wheel.height / 2);
    ctx.rotate(startAngle + anglePerSegment / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = `${wheel.width / 25}px Arial bold`;
    ctx.fillText(prizes[i].name, wheel.width / 3, 60);
    ctx.restore();

    const img = new Image();
    img.src = prizes[i].img;
    img.onload = (() => {
      return () => {
        ctx.save();
        ctx.translate(wheel.width / 2, wheel.height / 2);
        ctx.rotate(startAngle + anglePerSegment / 2);
        ctx.drawImage(img, wheel.width / 3 - 40, -40, 80, 80);
        ctx.restore();
      };
    })();
  }
}
window.onload = drawWheel;

// دوران العجلة
function spinWheel() {
  const numSegments = prizes.length;
  const anglePerSegment = 360 / numSegments;

  const confettiCanvas = document.getElementById("confetti");
  confettiCanvas.getContext("2d").clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  const totalProb = prizes.reduce((sum, p) => sum + p.prob, 0);
  const rand = Math.random() * totalProb;
  let sum = 0, winningIndex = 0;

  for (let i = 0; i < prizes.length; i++) {
    sum += prizes[i].prob;
    if (rand < sum) {
      winningIndex = i;
      break;
    }
  }

  const stopAngle = (winningIndex * anglePerSegment) + (anglePerSegment / 2);

  const pointer = document.getElementById("pointer");
  pointer.style.transition = "none";
  pointer.style.transform = "translate(-50%, -50%) rotate(0deg)";
  setTimeout(() => {
    pointer.style.transition = "transform 5s ease-out";
    pointer.style.transform = `translate(-50%, -50%) rotate(${360*5 + stopAngle}deg)`;
  }, 50);

  setTimeout(() => {
    const prize = prizes[winningIndex];

    winnerImg.src = prize.img;
    winnerImg.classList.remove("hidden");
    winnerDiv.classList.remove("hidden");

    if (prize.name === "Try Again") {
      const randomMsg = tryAgainMessages[Math.floor(Math.random() * tryAgainMessages.length)];
      winnerText.textContent = randomMsg;
      winnerText.className = "try";
      spinAllowed = true;
    } else if (prize.name === "Lose") {
      const randomMsg = loseMessages[Math.floor(Math.random() * loseMessages.length)];
      winnerText.textContent = randomMsg;
      winnerText.className = "lose";
      spinAllowed = false;
    } else {
      winnerText.textContent = "🎉 Congrats! You’ve won : " + prize.name;
      winnerText.className = "success";
      spinAllowed = false;
      startConfetti();
    }

    pointer.style.animation = "shake 0.5s";
    setTimeout(() => { pointer.style.animation = ""; }, 500);

    // بعد 30 ثانية الغطاء يرجع يغطي العجلة
    setTimeout(() => {
      wheelCover.classList.remove("hidden");
      spinAllowed = false;
    }, 30000);

  }, 5000);
}

// كونفتي
function startConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 10,
      h: 10,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      speed: Math.random() + 1
    });
  }

  let animationId;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      p.y += p.speed;
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
    animationId = requestAnimationFrame(draw);
  }

  draw();

  setTimeout(() => {
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 5000);
}

// الأحداث
spinBtn.addEventListener("click", () => {
  if (!spinAllowed) {
    passwordModal.classList.remove("hidden");
  } else {
    spinWheel();
  }
});

submitPassword.addEventListener("click", () => {
  if (passwordInput.value === "1234") {
    spinAllowed = true;
    passwordModal.classList.add("hidden");
    wheelCover.classList.add("hidden"); // إخفاء الغطاء بأنيميشن
    alert("تم تفعيل العجلة ✅");
  } else {
    alert("كلمة المرور غير صحيحة");
  }
});

// فتح لوحة التحكم بالضغط على اللوجو (3 مرات)
logo.addEventListener("click", () => {
  clickCount++;
  
  // أول ضغطة تبدأ عداد الوقت (5 ثواني)
  if (clickCount === 1) {
    clickTimer = setTimeout(() => clickCount = 0, 5000);
  }

  // لو ضغط 3 مرات خلال 5 ثواني
  if (clickCount === 3) {
    clearTimeout(clickTimer);
    const adminPass = prompt("أدخل كلمة مرور الإدارة");
    if (adminPass === "admin123") {
      adminPanel.classList.remove("hidden");
      loadAdminPanel();
    } else {
      alert("كلمة مرور خاطئة");
    }
    clickCount = 0; // إعادة العداد
  }
});

// تحميل لوحة التحكم
function loadAdminPanel() {
  prizeSettings.innerHTML = "";
  prizes.forEach((p, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <label>اسم الجائزة:</label>
      <input type="text" id="name-${i}" value="${p.name}">
      <br>
      <label>نسبة الحظ:</label>
      <input type="number" id="prob-${i}" value="${p.prob}">
      <br>
      <label>صورة:</label>
      <input type="text" id="img-${i}" value="${p.img}">
    `;
    prizeSettings.appendChild(div);
  });
}

// حفظ التعديلات من لوحة التحكم
saveAdmin.addEventListener("click", () => {
  prizes.forEach((p,i) => {
    p.name = document.getElementById(`name-${i}`).value;
    p.prob = parseInt(document.getElementById(`prob-${i}`).value);
    p.img = document.getElementById(`img-${i}`).value;
  });
  alert("تم حفظ التعديلات ✅");
  drawWheel(); // إعادة رسم العجلة بالقيم الجديدة

});
