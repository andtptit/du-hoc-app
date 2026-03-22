import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

// Đọc cấu hình từ file json
const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));

// Khởi tạo App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Thông tin tài khoản admin cần tạo
const email = "marketingthtt@gmail.com";
const password = "AdminPassword@123";

console.log(`Đang cố gắng tạo tài khoản: ${email}...`);

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log(`✅ TẠO THÀNH CÔNG TÀI KHOẢN ADMIN: ${userCredential.user.email}`);
    console.log(`🔑 Mật khẩu mặt định: ${password}`);
    console.log(`Vui lòng đăng nhập và bảo mật thông tin này!`);
    process.exit(0);
  })
  .catch((error) => {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️ Tài khoản ${email} ĐÃ TỒN TẠI trên Firebase mất rồi! Bạn có thể trực tiếp lấy mật khẩu cũ hoặc reset trên Firebase Console.`);
      process.exit(0);
    } else {
      console.error("❌ Lỗi khi khởi tạo:", error.message);
      process.exit(1);
    }
  });
