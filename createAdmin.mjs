import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { readFileSync } from 'fs';

// Đọc cấu hình từ file json
const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));

// Khởi tạo App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Thông tin tài khoản lấy từ biến môi trường hoặc tham số dòng lệnh
// Cách dùng:
//   node createAdmin.mjs <email> <password>
// hoặc:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node createAdmin.mjs
const email = process.argv[2] || process.env.ADMIN_EMAIL;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('❌ Thiếu thông tin. Cách dùng:');
  console.error('   node createAdmin.mjs <email> <password>');
  console.error('   hoặc đặt biến môi trường ADMIN_EMAIL và ADMIN_PASSWORD');
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Mật khẩu cần tối thiểu 8 ký tự.');
  process.exit(1);
}

console.log(`Đang tạo tài khoản: ${email}...`);

createUserWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    console.log(`✅ TẠO THÀNH CÔNG TÀI KHOẢN: ${userCredential.user.email}`);
    // Gửi email xác thực — firestore.rules yêu cầu email_verified == true
    // thì tài khoản admin (theo danh sách email) mới có quyền ghi.
    try {
      await sendEmailVerification(userCredential.user);
      console.log('📧 Đã gửi email xác thực. Hãy mở hộp thư và bấm link xác thực trước khi dùng quyền Admin.');
    } catch (e) {
      console.warn('⚠️ Không gửi được email xác thực:', e.message);
    }
    console.log('Lưu ý: email này phải nằm trong danh sách admin ở firestore.rules.');
    process.exit(0);
  })
  .catch((error) => {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️ Tài khoản ${email} đã tồn tại. Có thể reset mật khẩu trên Firebase Console nếu cần.`);
      process.exit(0);
    } else {
      console.error('❌ Lỗi khi khởi tạo:', error.message);
      process.exit(1);
    }
  });
